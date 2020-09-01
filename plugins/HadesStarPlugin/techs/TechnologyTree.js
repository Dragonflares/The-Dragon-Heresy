import TechData from '../../../assets/techs.json';
import { Technology } from './Technology';
import { findBestMatch } from 'string-similarity';

class TechnologyTree{
	constructor(){
		this.technologies = new Map();
	}

	find(query){
		query = query.toLowerCase();

		if(this.technologies.has(query))
			return this.technologies.get(query);

		const rate = findBestMatch(query, [...this.technologies.keys()]);
		return this.technologies.get(rate.bestMatch.target);
	}

	static load(){
		logger.debug("Loading Technology Tree...");
		const tree = new TechnologyTree();
		Object.entries(TechData).forEach(([name, data]) => {


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

			tree.technologies.set(name.toLowerCase(), new Technology(settings));
		});

		return tree;
	}
}

export const TechTree = TechnologyTree.load();