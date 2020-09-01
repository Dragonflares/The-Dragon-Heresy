import camelize from 'camelize';

class TechnologyProperty{
	constructor(name, data){
		this.name = name;
		this.data = data;
	}
}

export class Technology {
	constructor({
		name 		= "Unnamed Tech",
		description = "No description",
		category	= "Uncategorized",
		image 		= "",
		levels 		= 0,
		properties 	= {}
	} = {}){
		this._name 		 	= name;
		this._description 	= description;
		this._image 		= image;
		this._levels 	 	= levels;
		this._properties 	= new Map(Array.from(properties));
	}

	get name(){ return this._name; }
	get description(){ return this._description; }
	get image(){ return this._image; }
	get levels(){ return this._levels; }
	get properties(){ return this._properties; }
}