import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
// import axios from 'axios';
import axiosInstance from '../utils/axiosInstance';

const ITEMS_PER_PAGE = 15;

const Orders = () => {
  const [bills, setBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterDate, setFilterDate] = useState('');
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCompleted, setShowCompleted] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get('/get-orders');
      const allOrders = response.data.orders || [];
      const filteredOrders = showCompleted
        ? allOrders.filter((order) => order.bill)
        : allOrders.filter((order) => !order.bill);

      setOrders(filteredOrders);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch orders.');
      console.error('Error fetching orders:', error);
    }
  };

  const billCreator = async () => {
    try {
      const billArray = [];
      for (let order of orders) {
        const orderValue = order.cart.reduce((sum, item) => sum + item.product.price*item.qty, 0)
        try {
          const response = await axiosInstance.get(`/get-customer/${order.customerId}`);
          const customerData = response.data.customer;
          const bill = {
            id: order._id,
            name: customerData.name,
            address: customerData.address,
            contact: customerData.contact,
            billDate: order.updatedAt,
            billLink: order.bill,
            customerId: order.customerId,
            orderValue
          };
          billArray.push(bill);
        } catch (error) {
          console.error(`Error fetching customer data for order ${order.id}:`, error);
        }
      }
      setBills(billArray);
    } catch (error) {
      Alert.alert('Error', 'Failed to create bills.');
      console.error('Error creating bills:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [showCompleted]);

  useEffect(() => {
    if (orders.length > 0) {
      billCreator();
    }
  }, [orders]);

  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  const handleSortChange = () => {
    const sortedBills = [...bills].sort((a, b) => {
      return sortDirection === 'asc'
        ? new Date(a.billDate).getTime() - new Date(b.billDate).getTime()
        : new Date(b.billDate).getTime() - new Date(a.billDate).getTime();
    });
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    setBills(sortedBills);
  };

  const filteredBills = bills.filter((bill) => {
    const billDate = new Date(bill.billDate).toISOString().split('T')[0];
    return (
      bill.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!filterDate || billDate === filterDate)
    );
  });

  const totalPages = Math.ceil(filteredBills.length / ITEMS_PER_PAGE);
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleCheckboxChange = () => {
    setShowCompleted(!showCompleted);
  };

  const handleDeleteOrder = async (id) => {
    try {
      await axiosInstance.delete(`/delete-order/${id}`);
      // setOrders((prevOrders) => prevOrders.filter((order) => order.id == id));
      Alert.alert('Success', 'Order deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete order.');
      console.error('Error deleting order:', error);
    }
  };

  const handleGenOrder = async (orderId, customerId) => {
    if (!orderId) {
      return console.warn('No order found');
    }
    try {
      await axiosInstance.post(`/add-order/${orderId}`, {
        billPayment: 0,
        customerId,
      });
      Alert.alert('Success', 'Order placed successfully with zero payment.');
    } catch (error) {
      Alert.alert('Error', 'Failed to place order.');
      console.error(error);
    }
  };

  const renderBillItem = ({ item, index }) => (
    <View style={styles.card}>
      <Text>{`#${(currentPage - 1) * ITEMS_PER_PAGE + index + 1}`}</Text>
      <Text>ID: {item.id}</Text>
      <Text>Name: {item.name}</Text>
      <Text>Address: {item.address}</Text>
      <Text>Contact: {item.contact}</Text>
      <Text>Order Value: Rs.{item.orderValue}</Text>
      <Text>Date: {new Date(item.billDate).toLocaleDateString()}</Text>
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleDeleteOrder(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleDeleteOrder(item.id)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        {!item.billLink && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleGenOrder(item.id, item.customerId)}
          >
            <Text style={styles.buttonText}>Generate Bill</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search by name"
        value={searchQuery}
        onChangeText={handleSearchChange}
      />
      <TouchableOpacity style={styles.button} onPress={handleSortChange}>
        <Text style={styles.buttonText}>
          Sort by Date ({sortDirection === 'asc' ? 'Newest' : 'Oldest'})
        </Text>
      </TouchableOpacity>
      <FlatList
        data={paginatedBills}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBillItem}
      />
      <View style={styles.pagination}>
        <TouchableOpacity
          style={styles.button}
          disabled={currentPage === 1}
          onPress={handlePrevPage}
        >
          <Text style={styles.buttonText}>Prev</Text>
        </TouchableOpacity>
        <Text>Page {currentPage} of {totalPages}</Text>
        <TouchableOpacity
          style={styles.button}
          disabled={currentPage === totalPages}
          onPress={handleNextPage}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 40 },
  input: { marginBottom: 16, borderWidth: 1, padding: 8, borderRadius: 4 },
  button: { backgroundColor: '#007BFF', padding: 12, borderRadius: 4, marginTop: 8 },
  buttonText: { color: '#FFF', textAlign: 'center' },
  card: { marginBottom: 16, padding: 16, borderWidth: 1, borderRadius: 4 },
  actionContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
});

export default Orders;
