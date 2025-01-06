import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import axiosInstance from '../utils/axiosInstance';

const Customer = ({ navigation }) => {
  const [view, setView] = useState('add'); // 'add' or 'list'
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCustomer, setNewCustomer] = useState({ name: '', contact: '', address: '' });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (view === 'list') fetchCustomers();
  }, [view]);

  const fetchCustomers = async () => {
    setRefreshing(true);
    try {
      const response = await axiosInstance.get('/get-customers');
      const customerList = response.data.customers || [];
      setCustomers(customerList);
      setFilteredCustomers(customerList);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch customers');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    const lowerQuery = query.toLowerCase();
    setFilteredCustomers(
      customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(lowerQuery) ||
          customer.contact.toLowerCase().includes(lowerQuery)
      )
    );
  }, [customers]);

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

  const CustomerList = useCallback(() => (
    <>
      <TextInput
        style={styles.searchBar}
        placeholder="Search by name or contact"
        value={searchQuery}
        onChangeText={handleSearch}
        autoFocus={true} // Ensure the keyboard remains open
      />
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchCustomers} />}
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
                onPress={() => navigation.navigate('Sell', { customerId: item._id, customerName: item.name })}
                style={[styles.button, styles.deleteButton]}
              >
                <Text>Go to Sell</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </>
  ), [filteredCustomers, refreshing]);

  return (
    <View style={styles.container}>
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

      {view === 'add' ? (
        <View style={styles.form}>
          <Text style={styles.title}>{newCustomer._id ? 'Edit Customer' : 'Create New Customer'}</Text>
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
            <Text style={styles.buttonText}>{newCustomer._id ? 'Update Customer' : 'Add Customer'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <CustomerList />
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
    paddingTop: 40,
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
  searchBar: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
});
