import reservation from "./modules/reservation";


const modules = [reservation];
const store = {
    data: {}
};

for (const item of modules) {
    const { name, data, ...methods } = item;
    store.data[name] = data;
    store[name] = methods;
}
export default store;
