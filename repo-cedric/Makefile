# ═══════════════════════════════════════════════════════════════════════════
# Commandes raccourcies — taper "make <commande>" dans le terminal
# ═══════════════════════════════════════════════════════════════════════════

# Démarrer tout (avec logs)
start:
	docker-compose up

# Démarrer en arrière-plan
start-bg:
	docker-compose up -d

# Arrêter
stop:
	docker-compose down

# Voir les logs du backend
logs:
	docker-compose logs -f api

# Reconstruire après modification du code
rebuild:
	docker-compose up --build

# Tout supprimer et repartir de zéro
reset:
	docker-compose down -v
	docker-compose up --build

# Ouvrir une console dans le conteneur Node
shell:
	docker exec -it cedric_api sh

# Ouvrir Prisma Studio (interface visuelle base de données)
studio:
	docker exec -it cedric_api npx prisma studio

# Vérifier que tout tourne
status:
	docker-compose ps

.PHONY: start start-bg stop logs rebuild reset shell studio status
