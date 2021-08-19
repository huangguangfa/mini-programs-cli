import { isArray } from "@/utils/util.js"

let GLOBALINSTANCE = wx;
class Store {
    constructor( option = {} ) {
        this.bindStorageMode = !!option.bindStorageMode;
        let _state_ = option.state;
        this.state = this._initState( _state_ )
        this.mutation = {};
        this.action = option.action ?? {}
        this._polyfillMutation( this.mutation, _state_ )
    }
  
    _initState( _state_ = {} ) {
        let state = {};
        Object.keys( _state_ ).forEach( key => {
            let defval = _state_[key].default ?? _state_[key];
            if ( _state_[key].ISLOCAL ) {
                state[key] = this._getStorage(key, defval)
            } else {
                state[key] = defval
            }
        })
        return state
    }
  
    _setStorage(key, data) {
        GLOBALINSTANCE.setStorage({ key, data  })
    }
  
    _getStorage(key, def) {
        let res = GLOBALINSTANCE.getStorageSync(key)
        return res !== '' ? res : def
    }
    
    _polyfillMutation( mutation = {}, _state_ = {} ) {
        Object.keys(_state_).forEach( key => {
            if (!mutation[key] || typeof mutation[key] !== 'function') {
                mutation[key] = (state, data) => state[key] = data
            }
            mutation[key].ISLOCAL = !!_state_[key].ISLOCAL
        })
    }
  
    commit( type, data ) {
        if (typeof this.mutation[type] !== 'function') {
            throw new Error(`[minax]:The type of '${type}' is not find in state`)
        }
        this.mutation[type](this.state, data)
        // 如果需要持久化，则存入缓存
        if (this.mutation[type].ISLOCAL) {
            this._setStorage(type, this.state[type])
        }
        // 如果有订阅序列，则更新
        if ( this.registerQueue[type] ) {
            this.registerQueue[type].forEach( context => {
                this.updatePageStoreData(context, type, this.state[type])
            })
        }
    }
  
    dispatch(type, data) {
      if (typeof this.action[type] !== 'function') {
        throw new Error(`[minax]:The type of '${type}' is not find in action`)
      }
      this.action[type](Object.assign({}, this, {commit: this.commit.bind(this)}), data)
    }
  
    //更新页面所依赖的字段setData
    updatePageStoreData(context, key, value) {
        if (!(context && context.setData)) {
            throw new Error('Context not has setData method of updatePageStoreData')
        }
        let set_data = {};
        set_data[key] = value;
        context.setData(set_data);
    }

    //保存页面所依赖的字段
    registerQueue = {}
  
    //注册订阅列表
    registe( types = [], context ) {
        types.forEach( type => {
            if ( !this.state.hasOwnProperty(type) ) {
                throw new Error(`[minax]:The type of '${type}' is not find in state`)
            }
            this.updatePageStoreData(context, type, this.state[type]);
            if ( !this.registerQueue[type] ) {
                this.registerQueue[type] = []
            }
            if ( !this.registerQueue[type].includes(context) ) {
                this.registerQueue[type].push(context)
            }
        })
    }
    initStore( pageConfig, that ){
        let STOREINS = this;
        that.$store = STOREINS;
        if (pageConfig.mapState) {
            let mapState = [];
            if (isArray(pageConfig.mapState)) {
                mapState = pageConfig.mapState
            } else if (typeof pageConfig.mapState === 'string') {
                mapState.push(pageConfig.mapState)
            }
            STOREINS.registe(mapState, that);
        }
    }
  }
  
export default Store