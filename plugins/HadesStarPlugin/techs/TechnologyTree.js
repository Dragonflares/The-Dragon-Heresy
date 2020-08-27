class TechnologyTree{
	constructor(){

		this.technologies = new Map();
	}



	static load(){

		Object.entries(techData).forEach(([name, data] => {

			const settings = {
				name:name,
				description:data["Description"],
				category:data["Category"],
				image:data["Image"],
			}

			const tech = new Technology();



			tech.levels.add();


		}));
	}
}