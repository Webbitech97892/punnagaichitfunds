import React, { useState, useEffect } from "react";
import { View, Modal, ActivityIndicator, Text, FlatList, Dimensions, StyleSheet} from "react-native";
import { todayEarnings } from "../config/getAllApi";
import LinearGradient  from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

const windowWidth = Dimensions.get('window').width;
const windowHeight =  Dimensions.get('window').height;

export default function Today(props) {
    const [account, setAccount] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [total , setTotal] = useState('');

    useEffect(() => {
        getuserAcc();
        if (props.name === 'Today') {
            setModalVisible(true);
        }
    }, [props.name])
    const getuserAcc = async () => {
        const acc = await todayEarnings();        
        if (acc) {
            setTotal(acc.total_earnings);
            setModalVisible(false)
            setAccount(acc.individual_earnings);
        } else {
            setModalVisible(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.flex9}>
            <FlatList
                vertical
                data={account}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => {
                    return (
                        <View style={styles.table}>
                            <View style={{ flex: 0.23 }}>
                                <Text style={styles.user}>Name</Text>
                                <Text style={styles.user}>ID  </Text>
                                <Text style={styles.user}>Date  </Text>
                                <Text style={styles.user}>Amount</Text>
                            </View>
                            <View style={{ flex: 0.08 }}>
                                <Text style={styles.user}>  : </Text>
                                <Text style={styles.user}>  : </Text>
                                <Text style={styles.user}>  : </Text>
                                <Text style={styles.user}>  : </Text>
                            </View>

                            <View style={{ flex: 0.69 }}>
                                <Text style={styles.user}>{item.name}</Text>
                                <Text style={styles.user}>{item.id}</Text>
                                <Text style={styles.user}>{item.date}</Text>
                                <Text style={styles.user}>{item.amount}</Text>
                            </View>

                        </View>
                    )
                }

                } keyExtractor={item => item.id}
            />
            </View>
            {account.length >0 ?

            <View style={styles.totalAmount}>
            <LinearGradient style={[styles.search]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#e41e11', '#eb5f18', '#f0901f']} >
                    <Text style={[styles.trans]}>Total Amount : {total}</Text>
            </LinearGradient>
            </View> :null}
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
    user: { color: 'black', fontWeight: '500', fontSize: 13, lineHeight: 25 },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "rgba(0,0,0,0.6)"
    },
    flex9:{flex:0.9},
    modalView: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 30,
        elevation: 5,
    },
    wait: { color: 'black', fontSize: 15, marginTop: 15, fontWeight: '500' },
    table: { height: 130, width: windowWidth - 30, backgroundColor: 'white', padding: 15, elevation: 8, marginHorizontal: 15, marginVertical: 10, flexDirection: 'row', alignItems: 'center' },
    search: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', padding: 7, borderRadius: 10,height:50 },
    trans:{color:'white',fontSize: 15,fontWeight:'600'},
    container:{ marginBottom: 115, marginTop: 10 ,height:windowHeight-150},
    totalAmount:{flex:0.1,justifyContent:'flex-end',marginHorizontal:15}
 
});
