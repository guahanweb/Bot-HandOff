export default class MutableConfig {

    private static _instance:MutableConfig = new MutableConfig();
    constructor() {
        if (MutableConfig._instance) {
            throw new Error("Error: Instantiation failed: Use SingletonClass.getInstance() instead of new.");
        }
        MutableConfig._instance = this;
    }

    public static getInstance() {
        return MutableConfig._instance;
    }
}