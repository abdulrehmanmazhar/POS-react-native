import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
  Linking,
} from 'react-native';
import axiosInstance from '../utils/axiosInstance';
import DateTimePicker from '@react-native-community/datetimepicker';

const ITEMS_PER_PAGE = 10;

const Orders = () => {
  const [bills, setBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterDate, setFilterDate] = useState(new Date(Date.now()).toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCompleted, setShowCompleted] = useState(false);
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get('/me');
      setUserId(response.data.user._id);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch user data.');
    }
  };

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const response = await axiosInstance.get('/get-orders');
      const allOrders = response.data.orders || [];
      const userOrders = allOrders.filter((order) => order.createdBy === userId);
      const filteredOrders = showCompleted
        ? userOrders.filter((order) => order.bill)
        : userOrders.filter((order) => !order.bill);

      setOrders(filteredOrders);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch orders.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFilterDate(formattedDate);
    }
  };

  const billCreator = async () => {
    try {
      const billArray = await Promise.all(
        orders.map(async (order) => {
          const orderValue = order.cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
          try {
            const response = await axiosInstance.get(`/get-customer/${order.customerId}`);
            const customerData = response.data.customer;

            return {
              id: order._id,
              name: customerData.name,
              address: customerData.address,
              contact: customerData.contact,
              udhar: customerData.udhar,
              billDate: order.updatedAt,
              billLink: order.bill,
              customerId: order.customerId,
              orderValue,
              cart: order.cart,
            };
          } catch {
            return null;
          }
        })
      );

      setBills(billArray.filter((bill) => bill !== null));
    } catch {
      Alert.alert('Error', 'Failed to create bills.');
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [userId, showCompleted]);

  useEffect(() => {
    if (orders.length > 0) {
      billCreator();
    }
  }, [orders]);

  const handleSearchChange = (text) => setSearchQuery(text);

  const handleSortChange = () => {
    const sortedBills = [...bills].sort((a, b) =>
      sortDirection === 'asc'
        ? new Date(a.billDate) - new Date(b.billDate)
        : new Date(b.billDate) - new Date(a.billDate)
    );
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

  const BillLink = ({ link }) => {
    const openLink = async () => {
      try {
        const supported = await Linking.canOpenURL(link);
        if (supported) {
          await Linking.openURL(link);
        } else {
          console.error("Can't open the link:", link);
        }
      } catch (error) {
        console.error('Error opening link:', error);
      }
    };
    
  
    return (
      <TouchableOpacity onPress={openLink}>
        <Text style={styles.linkText}>Bill Link: {link}</Text>
      </TouchableOpacity>
    );
  };

  const renderBillItem = ({ item, index }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{`#${(currentPage - 1) * ITEMS_PER_PAGE + index + 1}`}</Text>
      <Text>Name: {item.name}</Text>
      <Text>Address: {item.address}</Text>
      <Text>Udhar: {item.udhar}</Text>
      <Text>Order Value: Rs.{item.orderValue}</Text>
      <Text>Date: {new Date(item.billDate).toLocaleDateString('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})}</Text>
      <TouchableOpacity
        style={styles.detailsButton}
        onPress={() => setSelectedBill(item)} // Open modal with selected bill
      >
        <Text style={styles.buttonText}>View Details</Text>
      </TouchableOpacity>
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
      <TouchableOpacity style={styles.button} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.buttonText}>Select Date</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={filterDate ? new Date(filterDate) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <TouchableOpacity style={styles.button} onPress={handleSortChange}>
        <Text style={styles.buttonText}>
          Sort by Date ({sortDirection === 'asc' ? 'Newest' : 'Oldest'})
        </Text>
      </TouchableOpacity>
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            { backgroundColor: showCompleted ? '#007BFF' : '#FFF', borderColor: '#000' },
          ]}
          onPress={() => setShowCompleted(!showCompleted)}
        >
          {showCompleted && <View style={styles.checkboxTick} />}
        </TouchableOpacity>
        <Text style={styles.checkboxLabel}>Show Completed</Text>
      </View>
      <FlatList
        data={paginatedBills}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBillItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchOrders} />
        }
      />
      <Modal
        visible={!!selectedBill}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedBill(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedBill && (
              <>
                <Text style={styles.modalTitle}>Order Details</Text>
                <Text>Order Value: Rs.{selectedBill.orderValue}</Text>
                {selectedBill.cart.map((portion)=>(<Text> {`${portion.product.name}(${portion.product.category}) x ${portion.qty}`}</Text>))}
                <Text>Date: {new Date(selectedBill.billDate).toLocaleDateString('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})}</Text>
                <BillLink link={selectedBill.billLink} />

                <TouchableOpacity
                  style={[styles.button, { marginTop: 16 }]}
                  onPress={() => setSelectedBill(null)}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
      <View style={styles.pagination}>
        <TouchableOpacity
          style={styles.pageButton}
          disabled={currentPage === 1}
          onPress={handlePrevPage}
        >
          <Text style={styles.buttonText}>Prev</Text>
        </TouchableOpacity>
        <Text style={styles.pageText}>
          Page {currentPage} of {totalPages}
        </Text>
        <TouchableOpacity
          style={styles.pageButton}
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
  refreshButton: { backgroundColor: '#28A745', padding: 12, borderRadius: 4, marginTop: 8 },
  buttonText: { color: '#FFF', textAlign: 'center' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  checkboxLabel: { marginLeft: 8, fontSize: 16 },
  card: { padding: 16, borderWidth: 1, borderRadius: 8, marginBottom: 8, backgroundColor: '#FFF' },
  cardTitle: { fontWeight: 'bold', marginBottom: 4 },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  pageButton: { backgroundColor: '#6C757D', padding: 12, borderRadius: 4 },
  pageText: { fontSize: 16 },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxTick: {
    width: 10,
    height: 10,
    backgroundColor: '#FFF',
    borderRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 8,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailsButton: {
    backgroundColor: '#28A745',
    padding: 10,
    borderRadius: 4,
    marginTop: 10,
  },
});

export default Orders;
