import TechData from '../../../assets/techs.json';
import { Technology } from './Technology';
import { findBestMatch } from 'string-similarity';

/**
 * Class used for Technology manipulation (mostly finding) and category hierarchy 
 */
class TechnologyTree{
	constructor(name){
		this.name = name;
		this.technologies = new Map();
		this.categories   = new Map();
	}

	/**
	 * Check if the tree has the given exact name of a technology or category
	 */
	has(name){
		name = name.toLowerCase();
		return this.technologies.has(name) || this.categories.has(name);
	}

	/**
	 * Get a technology from its exact name. All techs are returned if no name is provided
	 * @param {string} [name=null] - The exact technology name
	 */
	get(name = null){
		if(!name) return this.technologies;
		return this.technologies.get(name.toLowerCase());
	}

	/**
	 * Get a category from its exact name. All categories are returned if no name is provided
	 * @param {string} [name=null] - The exact category name
	 */
	getCategory(name = null){
		if(!name) return this.categories;
		return this.categories.get(name.toLowerCase());
	}

	/**
	 * Finds a technology from the given query. The term can be approximated.
	 * @param {string} query - The technology name
	 */
	find(query){
		query = query.toLowerCase();

		if(this.technologies.has(query))
			return this.technologies.get(query);

		const rate = findBestMatch(query, [...this.technologies.keys()]);
		return this.technologies.get(rate.bestMatch.target);
	}

	/**
	 * Finds a category from the given query. The term can be approximated.
	 * @param {string} query - The category name
	 */
	findCategory(query){
		query = query.toLowerCase();

		if(this.categories.has(query))
			return this.categories.get(query);

		const rate = findBestMatch(query, [...this.categories.keys()]);
		return this.categories.get(rate.bestMatch.target);
	}

	/**
	 * Loads the technology tree from the TechData json file
	 */
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