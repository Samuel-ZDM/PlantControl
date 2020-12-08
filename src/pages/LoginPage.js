import React from 'react';
import { TextInput, StyleSheet, View, ScrollView, 
         Button, ImageBackground, KeyboardAvoidingView, 
         ActivityIndicator, Alert } from 'react-native';
import FormRow from '../components/FormRow';
import firebase from 'firebase';

export default class LoginPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            senha: '',
            isLoading: false,
            message: "",
        };
    }

    componentDidMount() {
        var firebaseConfig = {
            apiKey: "AIzaSyBlraW32kvUGCqGYVMnuiwBiiqbc-vl-fc",
            authDomain: "notetimeline-samuel.firebaseapp.com",
            databaseURL: "https://notetimeline-samuel.firebaseio.com",
            projectId: "notetimeline-samuel",
            storageBucket: "notetimeline-samuel.appspot.com",
            messagingSenderId: "718384891068",
            appId: "1:718384891068:web:dbf768909fa78425d8fcb9",
            measurementId: "G-K2H80Q9DX3"
          };
        
        firebase.initializeApp(firebaseConfig);
    }

    onChangeHandler(field, value) {
        this.setState({ [field]: value });
    }

    acessarApp() {
        this.setState({ isLoading: false });
        this.props.navigation.replace('BlePage');
    }

    getMsgByErrorCode(errorCode) {
        switch (errorCode){
            case "auth/wrong-password":
                return "Senha incorreta!";
            case "auth/invalid-email":
                return "E-mail inválido!";
            case "auth/user-not-found":
                return "Usuário não encontrado!";
            case "auth/user-disabled":
                return "Usuário desativado!";
            case "auth/email-already-in-use":
                return "Usuário já está em uso!";
            case "auth/operation-not-allowed":
                return "Operação não permitida!";
            case "auth/weak-password":
                return "Senha muito fraca!";
            default:
                return "Erro desconhecido!";
        }
    }

    login() {
        this.setState({ isLoading: true, message: '' });
        const { email, senha } = this.state;
        
        return firebase
            .auth()
            .signInWithEmailAndPassword(email, senha)
            .then(user => {
                this.acessarApp();
            })
            .catch(error => {
                this.setState({ 
                    message: this.getMsgByErrorCode(error.code),
                    isLoading: false
                });
            })
    }

    cadastrar() {
        const { email, senha } = this.state;

        return firebase
            .auth()
            .createUserWithEmailAndPassword(email, senha)
            .then(user => { 
                this.acessarApp();
            })
            .catch(error => {
                this.setState({ 
                    message: this.getMsgByErrorCode(error.code),
                    isLoading: false
                });
            })
    }

    solicitaCadastro() {
        const { email, senha } = this.state;
        if (!email || !senha) {
            Alert.alert(
                "Cadastramento!", 
                "Para se cadastrar informe e-mail e senha"
            );
            return null;
        }
        Alert.alert(
            "Cadastramento!", 
            "Deseja cadastrar seu usuário com os dados informados?",
            [{
                text: "CANCELAR",
                style: 'cancel' // apenas para estilizar botão do IOS
            },{ 
                text: "CADASTRAR",
                onPress: () => { this.cadastrar() }
            }],
        );
    }

    renderButton() {
        if (this.state.isLoading)
            return <ActivityIndicator size="large" style={ styles.loading } />;

        return (
            <View>
                
                <View style={ styles.btn }>
                    <Button 
                        title='ENTRAR'
                        color='#808080'
                        onPress={()=> this.login() }
                    />
                </View>
                
                <View style={ styles.btn }>
                    <Button 
                        title='CADASTRE-SE'
                        color='#008e00'
                        onPress={()=> this.solicitaCadastro() }
                    />	
                </View>
            </View>
        )
    }

    renderMessage() {
        const { message } = this.state;
        if (!message)
            return null;

        Alert.alert(
            "Erro!", 
            message.toString(),
            [{ 
                text: 'OK',
                onPress: () => { this.setState({ message: '' }); }
            }]
        );
        
    }

    render() {
        return (
            // <KeyboardAvoidingView behavior="padding" enabled style={{flex: 1}}>
                <View style={ styles.container }>
                    {/* <View style={styles.logoView}> */}
                        <ImageBackground 
                            source={require('../img/logo.png')}
                            style={ styles.bgImage}
                            resizeMode="cover">
                     
                     
                       
                    {/* </View> */}

                    <FormRow>
                        <TextInput 
                            style={ styles.input }
                            placeholder="user@email.com"
                            keyboardType="email-address"
                            value={ this.state.email }
                            onChangeText={ value => this.onChangeHandler('email', value) }
                        />
                    </FormRow>
                    
                    <FormRow>
                        <TextInput 
                            style={ styles.input }
                            placeholder="********"
                            secureTextEntry
                            value={ this.state.senha }
                            onChangeText={ value => this.onChangeHandler('senha', value) }
                        />
                    </FormRow>
                
                    { this.renderButton() }
                    { this.renderMessage() }
                
                    </ImageBackground>
               
                </View>
               
                
                
            /* </KeyboardAvoidingView> */
            
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        flexDirection: 'row',
        paddingRight: 10,
        paddingLeft: 10,
        // backgroundColor: '#2C1526',
    },
    input: {
        paddingLeft: 5,
        paddingRight: 5,
    },
    btn: {
        paddingTop: 20,
        fontSize: 11,
    },
    bgImage: {
        flex: 1,
        marginHorizontal: -20,
        height:"100%",
        width:"100%",
    },    
    logo: {
        aspectRatio: 1,
        resizeMode: 'center',
        width: 400, 
        height: 400,
    },
    logoView: {
        justifyContent: "center",
        alignItems: "center",
    },    
    loading: {
        padding: 20,
    }
});