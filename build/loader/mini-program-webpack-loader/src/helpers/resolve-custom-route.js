const {  readFileSync } = require('fs')
const addRoute = (route, root = 'pages/') => {
    return `${root}${route.path}`
  }
  const addTabbar = (route) => {
    return {
      pagePath:addRoute(route),
      ...route.tabbar
    }
  }
  const formatRoute = (routes) => {
    let pages = []
    let subPackages = []
    let tabbarList = [];
    routes.forEach(function(route){
      if(route.isSub){
          subPackages.push({
            name:route.name,
            root:route.root,
            pages:formatSubRoute(route.pages)
          });
      } else {
        pages.push(addRoute(route))
        if(route.isTabbar){
          tabbarList.push(addTabbar(route))
        }
      }
    })
    return {
      pages,
      subPackages,
      tabbarList
    }
  }
  const formatSubRoute = (routes, root = '') => {
    let pages = [];
    routes.forEach(function(route){
      if(route.isSub){
        pages = pages.concat(formatSubRoute(route.pages, `${root}/${route.root}`))
      } else {
        pages.push(addRoute(route, !root ? '/' : `${root}/`))
      }
    })
    return pages
  }

  module.exports.getCustomRoute = function(route){
    let routeJSON = JSON.parse(
        readFileSync(route, { encoding: 'utf8' })
      )
      routeJSON = formatRoute(routeJSON.pages);
      return routeJSON
  }