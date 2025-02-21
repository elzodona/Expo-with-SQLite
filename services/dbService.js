// dbService.js
import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { usersTable } from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '../drizzle/migrations.js';

// Ouvre la base de données SQLite
const expo = SQLite.openDatabaseSync('db.db');
const db = drizzle(expo);

// Fonction pour effectuer les migrations
export const useDatabaseMigration = () => {
  const { success, error } = useMigrations(db, migrations);
  return { success, error };
};

// Fonction pour obtenir tous les utilisateurs
export const getUsers = async () => {
  try {
    const users = await db.select().from(usersTable);
    return users;
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des utilisateurs:", err);
    throw err;
  }
};

// Fonction pour ajouter un utilisateur
export const addUser = async (name, age, email) => {
  try {
    // Vérifie si l'email existe déjà
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('❌ L\'email existe déjà.');
    }

    const newUser = { name, age: parseInt(age), email };

    // Insertion de l'utilisateur
    await db.insert(usersTable).values([newUser]);

    // Récupère les utilisateurs après l'ajout
    return await getUsers();
  } catch (err) {
    console.error("❌ Erreur lors de l'ajout de l'utilisateur:", err);
    throw err;
  }
};

// Fonction pour vérifier et ajouter des utilisateurs de test
export const checkAndInsertUsers = async () => {
  try {
    const existingUsers = await db.select().from(usersTable).where(eq(usersTable.email, 'john@example.com'));
    const existingUser2 = await db.select().from(usersTable).where(eq(usersTable.email, 'alice@example.com'));

    if (existingUsers.length === 0 && existingUser2.length === 0) {
      await db.insert(usersTable).values([
        { name: 'John', age: 30, email: 'john@example.com' },
        { name: 'Alice', age: 25, email: 'alice@example.com' },
      ]);
    }
  } catch (err) {
    console.error("❌ Erreur lors de l'insertion des utilisateurs de test:", err);
    throw err;
  }
};
