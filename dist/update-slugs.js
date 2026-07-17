"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const project_entity_1 = require("./src/projects/entities/project.entity");
const dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'PgAdmin',
    database: 'essg_db',
    entities: [project_entity_1.Projet],
    synchronize: false,
});
async function updateSlugs() {
    try {
        await dataSource.initialize();
        console.log('Connexion à la base de données établie...');
        const projets = await dataSource.getRepository(project_entity_1.Projet).find();
        console.log(`Nombre de projets trouvés: ${projets.length}`);
        for (const projet of projets) {
            if (!projet.slug && projet.titre) {
                projet.slug = projet.titre
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                await dataSource.getRepository(project_entity_1.Projet).save(projet);
                console.log(`Slug généré pour "${projet.titre}": ${projet.slug}`);
            }
            else if (projet.slug) {
                console.log(`Slug déjà existant pour "${projet.titre}": ${projet.slug}`);
            }
        }
        console.log('Mise à jour terminée avec succès!');
        await dataSource.destroy();
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        process.exit(1);
    }
}
updateSlugs();
//# sourceMappingURL=update-slugs.js.map