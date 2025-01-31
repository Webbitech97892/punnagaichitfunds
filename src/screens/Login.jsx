import React, { useState } from "react";
import { Text, Modal, ActivityIndicator, Alert, View, SafeAreaView, Image, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import logo from '../assests/logo.png';
import LinearGradient from "react-native-linear-gradient";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Foundation from 'react-native-vector-icons/Foundation';
import { loginUser } from "../config/getAllApi";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { myAccount } from "../config/getAllApi";


export default function Login(props) {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [nameErr, setNameErr] = useState('');
    const [passErr, setPassErr] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const login = async () => {
        if (name === '') {
            setNameErr('Name is Required.')
        } else if (password === '') {
            setPassErr('Password is Required.')
        } else {
            setModalVisible(true);
            var obj = {};
            obj['name'] = name;
            obj['password'] = password;
            const login = await loginUser(obj);
            if (login?.response_status == 'success') {
                const acc = await myAccount(login.data.id);
                AsyncStorage.setItem("user_id", JSON.stringify(login.data.id))
                AsyncStorage.setItem("name", JSON.stringify(acc[0].agent_name))
                AsyncStorage.setItem("mobile", JSON.stringify(acc[0].agent_mobile))
                props.navigation.navigate('Home');
                setName('');
                setPassword('');
                setModalVisible(false)
            } else {
                Alert.alert(
                    "Error",
                    'Invalid password or user.',
                    [{ text: "OK", onPress: () => { } }],
                    { cancelable: false }
                );
                setModalVisible(false);
            }
        }
    }

    return (
        <SafeAreaView style={styles.background}>
            <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#e41e11', '#eb5f18', '#f0901f']} style={styles.linearEnd}>
                <Image source={logo} style={styles.imageStyle} />
            </LinearGradient>
            <View style={styles.container}>
                <View >
                    <Text style={styles.auth}>AGENT LOGIN</Text>
                </View>
                <View>
                    <Text style={styles.user}>User Name</Text>
                    <View style={styles.textInputView}>
                        <Ionicons name="person-circle-sharp" size={25} color="#f03009" style={{ marginLeft: 2 }} />
                        <TextInput
                            style={styles.input}
                            onChangeText={(text) => {
                                setNameErr(false);
                                setName(text);
                            }}
                            value={name}
                            autoCapitalize="characters"
                            placeholder="ENTER EMAIL/MOBILE"
                            placeholderTextColor={'#b5b5b5'}
                        />
                    </View>
                </View>
                {nameErr ?
                    <Text style={styles.nameErr}>{nameErr}</Text> : null}
                <View>
                    <Text style={styles.user}>Password</Text>
                    <View style={styles.textInputView}>
                        <Foundation name="key" size={25} color="#f03009" style={{ marginLeft: 5 }} />
                        <TextInput
                            style={styles.input}
                            onChangeText={(text) => {
                                setPassword(text)
                                setPassErr(false)
                            }}
                            value={password}
                            placeholder="PASSWORD"
                            placeholderTextColor={'#b5b5b5'}
                            autoCapitalize="characters"
                        />
                    </View>
                </View>
                {passErr ?
                    <Text style={styles.nameErr}>{passErr}</Text> : null}
                <TouchableOpacity onPress={login}>
                    <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#e41e11', '#eb5f18', '#f0901f']} style={[styles.search, { marginTop: 20, width: '55%', marginBottom: 20 }]}>
                        <Text style={[styles.trans, { fontSize: 13 }]}>LOGIN</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
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
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    input: {
        width: '90%',
        marginLeft: 8,
        color: 'black'
    },
    background: { flex: 1, backgroundColor: 'white' },
    imageStyle: { height: 125, width: 250, alignSelf: 'center' },
    linearEnd: { flex: 0.35, justifyContent: 'flex-end' },
    auth: { textAlign: 'center', color: '#727272', fontSize: 16, marginTop: 35 },
    container: { flex: 0.65, padding: 15 },
    user: { color: '#727272', fontSize: 15, marginTop: 20 },
    textInputView: { marginTop: 15, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#b5b5b5', borderRadius: 8, height: 40 },
    search: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', justifyContent: 'space-around', padding: 13, borderRadius: 10, },
    trans: { color: 'white', fontSize: 15, fontWeight: '600' },
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
    wait: { color: 'black', fontSize: 15, marginTop: 15, fontWeight: '500' },
    nameErr: { fontSize: 13, marginTop: 8, fontWeight: '400', color: "red" }
})