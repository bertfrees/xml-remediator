import ListIterator from "./ListIterator";


export default class ListIterable<T> implements Iterable<T>{

    public list:Array<T> = new Array<T>();
    public supplier:IterableIterator<T>;

    [Symbol.iterator](): Iterator<T> {
        return new ListIterator<T>({
            supplier:this.supplier,
            list:this.list,
        })
    }
    
    constructor(supplier:IterableIterator<T>){
        this.supplier=supplier;
    }
    
    static from<TData>(supplier:IterableIterator<TData>) {
        return new ListIterable<TData>(supplier);
    }


}