import React, { useState } from "react";
import { View, Modal, ActivityIndicator, Text, Alert, FlatList, Dimensions, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';
import { history } from "../config/getAllApi";

const windowWidth = Dimensions.get('window').width;

export default function History(props) {
    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);
    const [dateVal, setDateVal] = useState('');
    const [toDate, setToDate] = useState('');
    const [dateName, setDateName] = useState('');
    const [historyAcc, setHistoryAcc] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);

    const onChange = (event, selectedDate) => {
        if (event.type === "set") { // This ensures the user clicked 'OK' instead of dismissing the picker
            const currentDate = selectedDate || date;
            setShow(false); // Hide the DateTimePicker
            setDate(currentDate);
            const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
            if (dateName === 'to') {
                setToDate(formattedDate);
            } else if (dateName === 'from') {
                setDateVal(formattedDate);
            }
        } else {
            setShow(false); // Hide DateTimePicker if user dismisses it
        }
    };

    const onSearch = async () => {
        var obj = {};
        obj['from'] = dateVal;
        obj['to'] = toDate;
        if (props.name === 'History' && obj) {
            setModalVisible(true);
            const data = await history(obj);
            if (data) {
                setModalVisible(false);
                setHistoryAcc(data);
            }
        } else {
            setModalVisible(false)
            Alert.alert(
                "Error",
                customer.message,
                [{ text: "OK", onPress: () => { } }],
                { cancelable: false }
            );
        }
    }

    const showDatepicker = (name) => {
        setDateName(name);
        setShow(true);
    };

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.dateView}>
                <Text style={styles.from}>From Date</Text>
                <Text style={styles.colon}>:</Text>
                <View style={styles.calender}>
                    {dateVal ?
                        <Text style={styles.dateVal}>{dateVal}</Text> : <Text></Text>}
                    <TouchableOpacity onPress={() => showDatepicker('from')}>
                        <AntDesign name="calendar" size={20} color="#f35434" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={[styles.dateView, { paddingHorizontal: 15 }]}>
                <Text style={styles.from}>To Date</Text>
                <Text style={styles.colon}>:</Text>
                <View style={styles.calender}>
                    {toDate ?
                        <Text style={styles.dateVal}>{toDate}</Text> : <Text></Text>}
                    <TouchableOpacity onPress={() => showDatepicker('to')}>
                        <AntDesign name="calendar" size={20} color="#f35434" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.searchPdf}>
                <LinearGradient style={[styles.search]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#e41e11', '#eb5f18', '#f0901f']} >
                    <TouchableOpacity onPress={onSearch} style={styles.flexContainer}>
                        <AntDesign name='search1' size={20} color="white" />
                        <Text style={[styles.trans, { fontSize: 13, marginLeft: 8 }]}>SEARCH</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>

            {show && (
                <DateTimePicker
                    testID="dateTime"
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onChange}
                />
            )}

            <FlatList
                vertical
                data={historyAcc}
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
    )
}

const styles = StyleSheet.create({
    user: { color: 'black', fontWeight: '500', fontSize: 13, lineHeight: 25 },
    trans: { color: 'white', fontSize: 15, fontWeight: '600' },
    dateView: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    from: { color: 'black', fontSize: 14, fontWeight: '600', flex: 0.4 },
    colon: { color: 'black', fontSize: 18, fontWeight: '600', flex: 0.1 },
    calender: { flexDirection: 'row', alignItems: 'center', padding: 7, flex: 0.5, justifyContent: 'space-between', elevation: 3, backgroundColor: 'white' },
    searchPdf: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginVertical: 15 },
    search: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', padding: 7, borderRadius: 10 },
    flexContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
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
    table: { height: 130, width: windowWidth - 30, backgroundColor: 'white', padding: 15, elevation: 8, marginHorizontal: 15, marginVertical: 10, flexDirection: 'row', alignItems: 'center' },
    dateVal: { color: 'black', fontSize: 14, fontWeight: '500' }
});
