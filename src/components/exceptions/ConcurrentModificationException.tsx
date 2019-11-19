
export default class ConcurrentModificationException extends Error{
    constructor(message?:string){
        super(message);
    }
}