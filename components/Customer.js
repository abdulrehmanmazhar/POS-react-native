import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
// import axios from 'axios';\
import axiosInstance from '../utils/axiosInstance';

const Customer = () => {
  const [view, setView] = useState('add'); // 'add' or 'list'
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    contact: '',
    address: '',
  });

  useEffect(() => {
    if (view === 'list') {
      fetchCustomers();
    }
  }, [view]);

  const fetchCustomers = async () => {
    try {
      const response = await axiosInstance.get('/get-customers');
      setCustomers(response.data.customers);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch customers');
    }
  };

  const handleInputChange = (key, value) => {
    setNewCustomer((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddOrEditCustomer = async () => {
    const { name, contact, address, _id } = newCustomer;
    if (!name || !contact || !address) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      if (_id) {
        await axiosInstance.put(`/edit-customer/${_id}`, newCustomer);
        Alert.alert('Success', 'Customer updated successfully');
      } else {
        await axiosInstance.post('/add-customer', newCustomer);
        Alert.alert('Success', 'Customer added successfully');
      }
      setNewCustomer({ name: '', contact: '', address: '' });
      setView('list');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save customer');
    }
  };

  const handleDeleteCustomer = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosInstance.delete(`/delete-customer/${id}`);
              Alert.alert('Success', 'Customer deleted successfully');
              fetchCustomers();
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to delete customer');
            }
          },
        },
      ]
    );
  };

  const handleEditCustomer = (customer) => {
    setNewCustomer(customer);
    setView('add');
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.topBarButton, view === 'add' && styles.activeButton]}
          onPress={() => setView('add')}
        >
          <Text style={styles.topBarText}>Add Customer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.topBarButton, view === 'list' && styles.activeButton]}
          onPress={() => setView('list')}
        >
          <Text style={styles.topBarText}>Customer List</Text>
        </TouchableOpacity>
      </View>

      {/* Dynamic Content */}
      {view === 'add' ? (
        <View style={styles.form}>
          <Text style={styles.title}>
            {newCustomer._id ? 'Edit Customer' : 'Create New Customer'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={newCustomer.name}
            onChangeText={(text) => handleInputChange('name', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Contact"
            value={newCustomer.contact}
            onChangeText={(text) => handleInputChange('contact', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={newCustomer.address}
            onChangeText={(text) => handleInputChange('address', text)}
          />
          <TouchableOpacity style={styles.button} onPress={handleAddOrEditCustomer}>
            <Text style={styles.buttonText}>
              {newCustomer._id ? 'Update Customer' : 'Add Customer'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.customerCard}>
              <Text style={styles.customerName}>{item.name}</Text>
              <Text>Contact: {item.contact}</Text>
              <Text>Address: {item.address}</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.editButton]}
                  onPress={() => handleEditCustomer(item)}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={() => handleDeleteCustomer(item._id)}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default Customer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f7f8fa',
    paddingTop: 40
  },
  topBar: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  topBarButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
    borderRadius: 6,
  },
  activeButton: {
    backgroundColor: '#007BFF',
  },
  topBarText: {
    color: '#fff',
    fontWeight: '600',
  },
  form: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  customerCard: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    marginBottom: 12,
    elevation: 2,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    flex: 0.48,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    flex: 0.48,
  },
});
