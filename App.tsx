// App.js
import { Text, View, TextInput, Button } from 'react-native';
import { useState, useEffect } from 'react';
import { useDatabaseMigration, getUsers, addUser, checkAndInsertUsers } from './services/dbService';
import { usersTable } from './db/schema';

export default function App() {
  const { success, error } = useDatabaseMigration();
  const [items, setItems] = useState<typeof usersTable.$inferSelect[] | null>(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (success) {
      // Vérifie et insère les utilisateurs de test si nécessaire
      checkAndInsertUsers().then(async () => {
        const users = await getUsers();
        setItems(users);
      }).catch(err => {
        console.error("Erreur lors de la mise à jour des utilisateurs:", err);
      });
    }
  }, [success]);

  const handleAddUser = async () => {
    if (!name || !age || !email) {
      console.error('❌ Veuillez remplir tous les champs.');
      return;
    }

    try {
      const updatedUsers = await addUser(name, age, email);
      setItems(updatedUsers);
      setName('');
      setAge('');
      setEmail('');
    } catch (err) {
      console.error("❌ Erreur lors de l'ajout de l'utilisateur:", err);
    }
  };

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
    <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', justifyContent: 'center' }}>
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

      <Button title="Ajouter un utilisateur" onPress={handleAddUser} />
    </View>
  );
}
