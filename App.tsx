import { Text, View, TextInput, Button } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { usersTable } from './db/schema';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from './drizzle/migrations';
import { eq } from 'drizzle-orm';

// 📌 Ouvre la base de données SQLite
const expo = SQLite.openDatabaseSync('db.db');
const db = drizzle(expo);

export default function App() {
  const { success, error } = useMigrations(db, migrations);
  const [items, setItems] = useState<typeof usersTable.$inferSelect[] | null>(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');

  console.log("Migration success:", success);
  console.log("Migration error:", error);


  const addUser = async () => {
    try {
      if (!name || !age || !email) {
        console.error('❌ Veuillez remplir tous les champs.');
        return;
      }

      // Vérifie si l'email existe déjà dans la base de données
      const existingUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email)) // Utilisation de eq pour comparer l'email
        .limit(1);

      if (existingUser.length > 0) {
        console.error('❌ L\'email existe déjà.');
        return;
      }

      const newUser = { name, age: parseInt(age), email };

      await db.insert(usersTable).values([newUser]);

      const users = await db.select().from(usersTable);
      setItems(users);

      setName('');
      setAge('');
      setEmail('');
    } catch (err) {
      console.error("❌ Erreur lors de l'ajout de l'utilisateur:", err);
    }
  };


  useEffect(() => {
    if (!success) {
      console.log("⏳ Migration en cours...");
      return;
    }

    console.log("✅ Migration terminée !");

    (async () => {
      try {
        await db.delete(usersTable);
        
        // Vérifier si les utilisateurs existent déjà avant d'insérer
        const existingUsers = await db
          .select()
          .from(usersTable)
          .where(
            eq(usersTable.email, 'john@example.com')
          );
          
        const existingUser2 = await db
          .select()
          .from(usersTable)
          .where(
            eq(usersTable.email, 'alice@example.com')
          );

        // Si les utilisateurs n'existent pas, on les insère
        if (existingUsers.length === 0 && existingUser2.length === 0) {
          await db.insert(usersTable).values([
            { name: 'John', age: 30, email: 'john@example.com' },
            { name: 'Alice', age: 25, email: 'alice@example.com' },
          ]);

          const users = await db.select().from(usersTable);
          setItems(users);
        } else {
          console.log("⚠️ Un ou plusieurs utilisateurs existent déjà.");
        }
      } catch (err) {
        console.error("❌ Erreur base de données:", err);
      }
    })();
  }, [success]);

  // 📌 Gestion des erreurs de migration
  if (error) {
    return (
      <View>
        <Text style={{ color: 'red' }}>❌ Erreur de migration : {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View>
        <Text>⏳ Migration en cours...</Text>
      </View>
    );
  }

  if (!items || items.length === 0) {
    return (
      <View>
        <Text>⚠️ Aucun utilisateur trouvé.</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
      }}
    >
      <Text>👥 Liste des utilisateurs :</Text>
      {items.map((item) => (
        <Text key={item.id}>📧 {item.email}</Text>
      ))}

      {/* Formulaire pour ajouter un utilisateur */}
      <TextInput
        placeholder="Nom"
        value={name}
        onChangeText={setName}
        style={{ margin: 10, padding: 10, borderWidth: 1, width: '80%' }}
      />
      <TextInput
        placeholder="Âge"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        style={{ margin: 10, padding: 10, borderWidth: 1, width: '80%' }}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={{ margin: 10, padding: 10, borderWidth: 1, width: '80%' }}
      />

      <Button title="Ajouter un utilisateur" onPress={addUser} />

    </View>
  );
}
