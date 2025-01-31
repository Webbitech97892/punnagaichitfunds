import React, { useEffect, useState } from "react";
import { View, Image, Alert, ActivityIndicator, Modal, Text, SafeAreaView, StyleSheet, TextInput, ScrollView, TouchableOpacity } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import logo from '../assests/logo.png';
import { searchCustomer, payment } from '../config/getAllApi';
import { getUserName, getUserMobile } from "../config/localStorage";

export default function Collection(props) {
    const [number, setNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [searchData, setSearchData] = useState('')
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        getUserDetails();
    }, []);

    const getUserDetails = async () => {
        const name = JSON.parse(await getUserName());
        const phone = JSON.parse(await getUserMobile());
        if (name || phone) {
            setName(name);
            setPhoneNumber(phone);
        }
    }

    const search = async () => {
        setModalVisible(true);
        const search = await searchCustomer(number);
        if (search.data) {
            setModalVisible(false);
            Alert.alert(
                "sucesss",
                'Customer Data Fetched Successfully',
                [{
                    text: "OK", onPress: () => {
                        setSearchData(search.data)
                    }
                }
                ],
                { cancelable: false }
            );
        } else {
            alert('No Customer Data Available');
            setModalVisible(false)
        }
    }

    const payNow = async () => {
        if (searchData) {
            setModalVisible(true);
            const pay = await payment(searchData, amount);
            if (pay) {
                setModalVisible(false);
                Alert.alert(
                    "sucesss",
                    pay.message,
                    [{
                        text: "OK", onPress: () => {
                            setAmount('');
                        }
                    }],
                    { cancelable: false }
                );
            }
        } else {
            alert('Please enter customer Id');
            setAmount('')
        }
    }


    return (
        <SafeAreaView style={styles.background}>
            <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#e41e11', '#eb5f18', '#f0901f']} style={styles.linearEnd}>
                <TouchableOpacity onPress={() => props.navigation.goBack()} style={styles.flex1}>
                    <AntDesign name='arrowleft' size={30} color="white" />
                </TouchableOpacity>
                <View style={styles.flex7}>
                    <View style={styles.imageView}>
                        <Image source={logo} style={styles.imageStyle} />
                    </View>
                </View>
            </LinearGradient>
            <ScrollView>
                <View style={styles.profile}>
                    <Text style={styles.agent}>Agent Name : {name} </Text>
                    <Text style={[styles.agent, { lineHeight: 25 }]}>Mobile No : {phoneNumber}</Text>
                </View>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => setNumber(text)}
                    value={number}
                    placeholder="Search Customer Id"
                    placeholderTextColor={'#b5b5b5'}
                    autoCapitalize="characters"

                />
                <TouchableOpacity onPress={search}>
                    <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#e41e11', '#eb5f18', '#f0901f']} style={[styles.search]}>
                        <AntDesign name='search1' size={20} color="white" />
                        <Text style={[styles.trans, { fontSize: 13 }]}>SEARCH</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <View style={styles.userDetails}>
                    <View style={styles.flex45}>
                        <Text style={styles.detail}>Name</Text>
                        <Text style={styles.detail}>Mobile</Text>
                        <Text style={styles.detail}>Chit Plan</Text>
                        <Text style={styles.detail}>Group Name</Text>
                        <Text style={styles.detail}>Chit Started Date</Text>
                        <Text style={styles.detail}>Total Paid Amount</Text>
                        <Text style={styles.detail}>Pending Amount</Text>
                        <Text style={styles.detail}>Next Chit Date</Text>
                    </View>
                    <View style={styles.flex45}>
                        {searchData ? <>
                            <Text style={[styles.detail, { color: 'black' }]}>{searchData.name}</Text>
                            <Text style={[styles.detail, { color: 'black' }]}>{searchData.mobile}</Text>
                            <Text style={[styles.detail, { color: 'black' }]}>{searchData.chit_plan}</Text>
                            <Text style={[styles.detail, { color: 'black' }]}>{searchData.group_name}</Text>
                            <Text style={[styles.detail, { color: 'black' }]}>{searchData.chit_started_date}</Text>
                            <Text style={[styles.detail, { color: 'black' }]}>{searchData.total_paid_amount}</Text>
                            <Text style={[styles.detail, { color: 'black' }]}>{searchData.pending_amount}</Text>
                            <Text style={[styles.detail, { color: 'black' }]}>{searchData.next_chit_date}</Text>
                        </> : null}
                    </View>
                </View>
                <TextInput
                    style={[styles.input, { width: '35%', alignSelf: 'center' }]}
                    onChangeText={(text) => setAmount(text)}
                    value={amount}
                    placeholder="Enter Amount"
                    placeholderTextColor={'#b5b5b5'}
                    autoCapitalize="characters"

                />
                <TouchableOpacity onPress={payNow}>
                    <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#e41e11', '#eb5f18', '#f0901f']} style={[styles.search, { marginTop: 20, width: '40%', marginBottom: 20 }]}>
                        <Text style={[styles.trans, { fontSize: 13 }]}>PAY NOW</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <Modal
                    animationType="left"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <ActivityIndicator size="large" color="red" />
                            <Text style={styles.wait}>Please Wait</Text>
                        </View>
                    </View>
                </Modal>
            </ScrollView>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    background: { flex: 1, backgroundColor: 'white' },
    linearEnd: { height: 58, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
    imageStyle: { height: 45, width: 45, objectFit: 'contain', alignSelf: 'center' },
    imageView: { height: 50, width: 50, borderRadius: 50, backgroundColor: 'white' },
    trans: { color: 'white', fontSize: 15, fontWeight: '600' },
    flex1: { flex: 0.3 },
    flex7: { flex: 0.4, alignItems: 'center' },
    search: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', justifyContent: 'space-around', padding: 10, borderRadius: 10, width: '32%' },
    input: {
        height: 45,
        margin: 15,
        borderWidth: 1,
        borderColor: '#e6e6e6',
        padding: 10,
        borderRadius: 5,
        color: 'black'
    },
    detail: { color: '#c25a5e', fontSize: 14, fontWeight: '500', lineHeight: 30 },
    profile: { backgroundColor: '#fdcbca', height: 120, justifyContent: 'center' },
    userDetails: { margin: 15, padding: 20, backgroundColor: 'white', elevation: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    agent: { fontWeight: '600', fontSize: 14, color: 'black', textAlign: 'center' },
    flex45: { flex: 0.45 },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "rgba(0,0,0,0.6)"
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 30,
        elevation: 5,
    },
    wait: { color: 'black', fontSize: 15, marginTop: 15, fontWeight: '500' }
});
