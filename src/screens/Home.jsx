import React from "react";
import { Text, Dimensions, View, SafeAreaView, Image, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import logo from '../assests/logo.png';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";

const windowWidth = Dimensions.get('window').width;

export default function Home(props) {

    const onClick = (name) => {
        if (name === 'Logout') {
            AsyncStorage.removeItem('user_id');
            props.navigation.navigate('Login');
        } else if (name === 'My account') {
            props.navigation.navigate('MyAccount')
        } else if (name === 'Transaction') {
            props.navigation.navigate('Transaction')
        } else if (name === 'Collection') {
            props.navigation.navigate('Collection')
        }
    }

    const bookData = [
        {
            name: 'My account',
            icon: <FontAwesome5 name="user-circle" size={45} color="#ff7d03" />
        },
        {
            name: 'Collection',
            icon: <FontAwesome name="dollar" size={45} color="#ff7d03" />
        },
        {
            name: 'Transaction',
            icon: <MaterialCommunityIcons name="home-lightbulb" size={45} color="#ff7d03" />
        },
        {
            name: 'Logout',
            icon: <MaterialCommunityIcons name="logout-variant" size={45} color="#ff7d03" />
        }
    ]

    return (
        <SafeAreaView style={styles.background}>
            <View style={styles.linearEnd}>
                <Image source={logo} style={styles.imageStyle} />
            </View>
            <View style={styles.container}>
                <FlatList
                    numColumns={2}
                    vertical
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    data={bookData}
                    showsVerti
                    calScrollIndicator={false}
                    renderItem={({ item, index }) =>
                        <TouchableOpacity activeOpacity={0.4} style={styles.view} onPress={() => onClick(item.name)}>
                            <View style={styles.icon}>{item.icon}</View>
                            <Text style={styles.dashboard}>{item.name}</Text>
                        </TouchableOpacity>
                    } keyExtractor={item => item.id}
                />
            </View>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    background: { flex: 1, backgroundColor: 'white' },
    imageStyle: { height: 125, width: 250, alignSelf: 'center' },
    linearEnd: { flex: 0.35, justifyContent: 'center', backgroundColor: 'white' },
    container: { flex: 0.65, backgroundColor: '#f5f5f5' },
    view: { borderRadius: 10, elevation: 6, backgroundColor: 'white', margin: 15, height: windowWidth / 3.5, width: windowWidth / 2.4, justifyContent: 'center' },
    dashboard: { textAlign: 'center', color: 'black', fontSize: 15, fontWeight: '600', marginTop: 8 },
    icon: { alignSelf: 'center' }


})