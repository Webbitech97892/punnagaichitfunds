import React, { useEffect, useState } from "react";
import { Text,Dimensions, ActivityIndicator, Modal, View, SafeAreaView, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import { myAccount } from "../config/getAllApi";

export default function Home(props) {
    const windowWidth = Dimensions.get('window').width;
    const [account, setAccount] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        getuserAcc();
        setModalVisible(true);
    }, [])

    const getuserAcc = async () => {
        const acc = await myAccount();
        if (acc) {
            setAccount(acc);
            setModalVisible(false);
        } else {
            alert('Failed')
        }
    }

    return (
        <SafeAreaView style={styles.background}>
            <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#e41e11', '#eb5f18', '#f0901f']} style={styles.linearEnd}>
                <Text style={styles.header}>Suryadevchitfund</Text>
            </LinearGradient>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => props.navigation.goBack()}>
                    <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#e65274', '#d956a4', '#c35cec']} style={styles.backToHome}>
                        <View style={styles.backView}>
                            <AntDesign name="arrowleft" size={25} style={styles.arrow} />
                            <Text style={styles.back}>Back To Home</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.account}>Account Info</Text>
                
                <FlatList
                    numColumns={2}
                    vertical
                    data={account}
                    showsVerticalScrollIndicator={false}
                    calScrollIndicator={false}
                    renderItem={({ item, index }) => {
                        return (
                            <View style={{width:windowWidth}}>
                                <View style={styles.accountView}>
                                    <FontAwesome5 color="#f03009" name="user-secret" size={30} />
                                    <View style={{ marginLeft: 15 }}>
                                        <Text style={styles.name}>Name</Text>
                                        <Text style={styles.desc}>{item.agent_name}</Text>
                                    </View>
                                </View>
                                <View style={styles.border}></View>
                                <View style={styles.accountView}>
                                    <FontAwesome5 color="#f03009" name="user-secret" size={30} />
                                    <View style={{ marginLeft: 15 }}>
                                        <Text style={styles.name}>Mobile</Text>
                                        <Text style={styles.desc}>{item.agent_mobile}</Text>
                                    </View>
                                </View>
                                <View style={styles.border}></View>
                                <View style={styles.accountView}>
                                    <FontAwesome5 color="#f03009" name="user-secret" size={30} />
                                    <View style={{ marginLeft: 15 }}>
                                        <Text style={styles.name}>Address</Text>
                                        <Text style={styles.desc}>{item.agent_address}</Text>
                                    </View>
                                </View>
                                <View style={styles.border}></View>
                            </View>
                        )}
                    } keyExtractor={item => item.id}
                />

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
            </View>


        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    background: { flex: 1, backgroundColor: 'white' },
    linearEnd: { flex: 0.3, justifyContent: 'center', backgroundColor: 'white' },
    container: { flex: 0.7, padding: 15 },
    account: { color: 'black', fontSize: 20, fontWeight: '700', marginTop: 20 },
    back: { color: '#f7c8ed', fontSize: 21, textAlign: 'center', fontWeight: '700', alignItems: 'center', alignSelf: 'center', marginLeft: 10 },
    header: { color: '#ffd8b5', fontSize: 25, textAlign: 'center', fontWeight: '700' },
    backView: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center' },
    backToHome: { justifyContent: 'center', height: 70, width: '78%', alignSelf: 'center', borderRadius: 60, marginTop: -50 },
    arrow: { alignSelf: 'center', color: '#707070', backgroundColor: 'white', padding: 6, borderRadius: 30 },
    name: { color: '#000000', fontSize: 15, fontWeight: '600' },
    desc: { color: '#000000', fontSize: 13, fontWeight: '400', lineHeight: 22 },
    border: { height:2 , backgroundColor:'#f5f5f5',  marginTop: 8,width:'100%'},
    accountView: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
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


})