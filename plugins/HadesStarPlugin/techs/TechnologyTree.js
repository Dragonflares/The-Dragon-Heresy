import TechData from '../../../assets/techs.json';
import { Technology } from './Technology';
import { findBestMatch } from 'string-similarity';

class TechnologyTree{
	constructor(name){
		this.name = name;
		this.technologies = new Map();
		this.categories   = new Map();
	}

	has(name){
		name = name.toLowerCase();
		return this.technologies.has(name) || this.categories.has(name);
	}

	get(name = null){
		if(!name) return this.technologies;
		return this.technologies.get(name.toLowerCase());
	}

	find(query){
		query = query.toLowerCase();

		if(this.technologies.has(query))
			return this.technologies.get(query);

		const rate = findBestMatch(query, [...this.technologies.keys()]);
		return this.technologies.get(rate.bestMatch.target);
	}

	findCategory(query){
		query = query.toLowerCase();

		if(this.categories.has(query))
			return this.categories.get(query);

		const rate = findBestMatch(query, [...this.categories.keys()]);
		return this.categories.get(rate.bestMatch.target);
	}

	static load(){
		logger.debug("Loading Technology Tree...");
		const tree = new TechnologyTree("Root");
		Object.entries(TechData).forEach(([name, data]) => {
			const category = data.Category.toLowerCase();
			if(!tree.categories.has(category))
				tree.categories.set(category, new TechnologyTree(data.Category));


			const settings = {
				name:name,
				description:data.Description,
				category:data.Category,
				image:data.Image,
				levels:data.Level.length
			};

			delete data.Level;
			delete data.Category;
			delete data.Image;
			delete data.Description;

			settings.properties = data;


			const tech = new Technology(settings);
			tree.technologies.set(name.toLowerCase(), tech);
			tree.categories.get(category).get().set(name.toLowerCase(), tech);
		});

		return tree;
	}
}

export const TechTree = TechnologyTree.load();