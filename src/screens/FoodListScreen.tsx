import React, { useState, useEffect } from 'react';
import { FlatList, Box, Text, VStack, HStack, Spacer, IconButton, Select } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { getFoodItems, updateFoodItem, deleteFoodItem } from '../services/firestoreService';

export default function FoodListScreen() {
  const [foodItems, setFoodItems] = useState([]);
  const [sortBy, setSortBy] = useState('daysToExpiry');

  useEffect(() => {
    loadFoodItems();
  }, []);

  const loadFoodItems = async () => {
    try {
      const items = await getFoodItems();
      setFoodItems(items);
    } catch (error) {
      console.error('Error loading food items:', error);
    }
  };

  const sortItems = (items) => {
    return items.sort((a, b) => {
      if (sortBy === 'alertStatus') {
        return a.properties.alertStatus === 'active' ? -1 : 1;
      } else if (sortBy === 'daysToExpiry') {
        return parseInt(a.properties.daysToExpiry) - parseInt(b.properties.daysToExpiry);
      }
      return 0;
    });
  };

  const renderItem = ({ item }) => (
    <Box 
      borderBottomWidth="1" 
      borderColor="coolGray.200" 
      pl="4" 
      pr="5" 
      py="2"
      bg={item.properties.isInFridge === 'Yes' ? 'primary.100' : 'secondary.50'}
    >
      <HStack space={3} justifyContent="space-between">
        <VStack>
          <Text color="coolGray.800" bold>
            {item.name}
          </Text>
          <Text color="coolGray.600">
            Expires in: {item.properties.daysToExpiry}
          </Text>
          <Text color="coolGray.600">
            Price: ${item.price.toFixed(2)}
          </Text>
        </VStack>
        <Spacer />
        <IconButton
          icon={<Ionicons name={item.properties.alertStatus === 'active' ? 'notifications' : 'notifications-off'} size={24} color="gray" />}
          onPress={() => toggleAlertStatus(item)}
        />
        <IconButton
          icon={<Ionicons name="create-outline" size={24} color="gray" />}
          onPress={() => editItem(item)}
        />
        <IconButton
          icon={<Ionicons name="trash-outline" size={24} color="gray" />}
          onPress={() => deleteItem(item.id)}
        />
      </HStack>
    </Box>
  );

  const toggleAlertStatus = async (item) => {
    const newStatus = item.properties.alertStatus === 'active' ? 'inactive' : 'active';
    await updateFoodItem(item.id, { 'properties.alertStatus': newStatus });
    loadFoodItems();
  };

  const editItem = (item) => {
    // Implement edit functionality
  };

  const deleteItem = async (itemId) => {
    await deleteFoodItem(itemId);
    loadFoodItems();
  };

  return (
    <Box flex={1} bg="white" safeArea>
      <Select
        selectedValue={sortBy}
        minWidth="200"
        accessibilityLabel="Sort by"
        placeholder="Sort by"
        mt={1}
        onValueChange={(itemValue) => setSortBy(itemValue)}
      >
        <Select.Item label="Alert Status" value="alertStatus" />
        <Select.Item label="Days to Expiry" value="daysToExpiry" />
      </Select>
      <FlatList
        data={sortItems(foodItems)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </Box>
  );
}