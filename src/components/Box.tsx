import ListIterator from "./ListIterator";
import ListIterable from "./ListIterable";
import IllegalArgumentException from "./exceptions/IllegalArgumentException";

import QName from './QName';
import Attribute from './Attribute';
import { Properties } from "csstype";
import { symbol } from "prop-types";

enum BoxType {
	INLINE,
	BLOCK
}

/**
 * Box interface for json DTO
 */
interface BoxInterface {
	type:BoxType,
	name:QName,
	attributes:Array<Attribute>,
	text?:string,
	children:Array<Box>,
	props:Properties
}

export default class Box implements Iterable<Box>{
    public type:BoxType;
    public name:QName;
    public attributes:Array<Attribute>;
    public text?:string;
	
	public props:Properties;

	public childrenIterable:ListIterable<Box>;

	constructor(from:Box|BoxInterface) {
		this.type = from.type;
		this.name = from.name;
		this.attributes = from.attributes;
		this.text = from.text;
		this.props = from.props;
		if(from instanceof Box){
			this.childrenIterable = from.childrenIterable;
		} else { // BoxInterface (raw object)
			this.childrenIterable = ListIterable.from<Box>(from.children[Symbol.iterator]())
		}
	}


	[Symbol.iterator](): Iterator<Box, any, undefined> {
		return this.children;
	}

	get children(): ListIterator<Box> {
		return this.childrenIterable[Symbol.iterator]() as ListIterator<Box>;
	}

	get isBlockAndHasNoBlockChildren() {
		if (this.type == BoxType.INLINE)
			return false;
		else {
			var firstChild = this.children.next();
			if (!firstChild.done)
				return (firstChild.value.type == BoxType.INLINE)
			else
				return true;
		}
	}


	withName(name:QName) {
		var newBox = new Box(this);
		newBox.name = name;
		Object.freeze(newBox);
		return newBox;
	}

	withChildren(children:Array<Box> | ListIterator<Box>) {
		var newBox = new Box(this);

		if (children instanceof ListIterator)
			newBox.childrenIterable = ListIterable.from<Box>(children);
		else
			newBox.childrenIterable = ListIterable.from(children[Symbol.iterator]());

		if (this.type == BoxType.BLOCK) {
			var hasBlockChildren = null;
			var prevIsAnonymous = null;
			for (var c of newBox) {
				if (hasBlockChildren == null)
					hasBlockChildren = (c.type == BoxType.BLOCK);
				else if (hasBlockChildren != (c.type == BoxType.BLOCK))
					throw new IllegalArgumentException("block and inline can not be siblings");
				if (c.name == null && prevIsAnonymous == true)
					throw new IllegalArgumentException("no adjacent anonymous block boxes");
				prevIsAnonymous = (c.name == null);
			}
		} else {
			for (var c of newBox)
				if (c.type == BoxType.BLOCK)
					throw new IllegalArgumentException("no block inside inline");
		}
		Object.freeze(newBox);
		return newBox;
	}

	static parse(jsonString:string){
		let box = new Box(JSON.parse(
				jsonString,
				(key:any, value:any) => {
					if (key == 'children')
						return value.map((v:BoxInterface) => {
							var box = new Box(v);
							Object.freeze(box);
							return box;
						});
					else if (key == 'name' && value != null)
						return new QName(value);
					else
						return value;
				}
			) as BoxInterface);
		Object.freeze(box);
		return box;
		
	}
}