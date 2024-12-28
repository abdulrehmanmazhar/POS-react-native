import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
// import axios from 'axios';
import axiosInstance from '../utils/axiosInstance';

const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [refreshExpenses, setRefreshExpenses] = useState(false);

  const syncExpenses = () => {
    axiosInstance
      .get("/get-today-transactions")
      .then((response) => {
        setExpenses(response.data.transactions);
      })
      .catch((error) => {
        console.error('Error fetching expenses:', error);
      });
  };

  useEffect(() => {
    syncExpenses();
  }, [refreshExpenses]);

  const handleAddExpense = () => {
    if (description.trim() === '' || amount === '' || isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid description and amount!');
      return;
    }

    const newExpense = {
      type: "expense",
      description,
      amount: Number(amount),
    };

    axiosInstance
      .post("/create-transaction", newExpense)
      .then(() => {
        Alert.alert('Success', 'Expense added successfully');
        setRefreshExpenses(!refreshExpenses);
        setDescription('');
        setAmount('');
      })
      .catch((error) => {
        Alert.alert('Error', error.response?.data?.message || 'An error occurred');
      });
  };

  const handleDeleteExpense = (id) => {
    axiosInstance
      .delete(`/delete-transaction/${id}`)
      .then(() => {
        Alert.alert('Success', 'Expense deleted successfully');
        setRefreshExpenses(!refreshExpenses);
      })
      .catch((error) => {
        Alert.alert('Error', error.response?.data?.message || 'An error occurred');
      });
  };

  const renderExpenseItem = ({ item }) => (
    <View style={styles.expenseItem}>
      <Text style={styles.expenseText}>{item.description}</Text>
      <Text style={styles.expenseAmount}>Rs. {item.amount}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteExpense(item._id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Expenses</Text>

      {/* Input Section */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddExpense}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Expenses List */}
      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f8fa',
    paddingTop: 40
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#fff',
    marginBottom: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  list: {
    paddingBottom: 20,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  expenseText: {
    flex: 2,
    fontSize: 16,
  },
  expenseAmount: {
    flex: 1,
    textAlign: 'right',
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    padding: 5,
    backgroundColor: '#dc3545',
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default Expense;
