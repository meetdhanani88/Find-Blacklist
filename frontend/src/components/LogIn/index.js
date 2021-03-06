import React, { useState, useLayoutEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { Link as RouterLink } from "react-router-dom"
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useFormik } from 'formik'
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import * as Yup from 'yup'
import { useDispatch } from "react-redux"
import { useQueryClient, useMutation } from 'react-query'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import axiosInstance from '../../config';
import { LoginAction } from '../../redux/reducersSlice/Loginslice';
import { CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Toast from '../../Helper/Toast';
import { useEffect } from 'react';

const theme = createTheme();
const token = localStorage.getItem("token");

function LogIn({ setrole, role, path }) {
    const nav = useNavigate();
    const queryClient = useQueryClient()
    const dispatch = useDispatch();
    const [suceessmsg, setsuceessmsg] = useState(false)
    const [errmsg, seterrmsg] = useState(false)
    const [loading, setloading] = useState(true)
    // console.log(path);


    //password validation
    const lowercaseRegEx = /(?=.*[a-z])/;
    const uppercaseRegEx = /(?=.*[A-Z])/;
    const numericRegEx = /(?=.*[0-9])/;
    const lengthRegEx = /(?=.{6,})/;


    useLayoutEffect(() => {
        if (role === 1 && token && path.slice(0, 6) === "/admin") {
            nav(path, { replace: true })
        }
        else if (role === 2 && token && path.slice(0, 5) === "/user") {
            nav(path, { replace: true })
        }
        else if (role === 1 && token) {
            nav("/admin", { replace: true })
        }
        else if (role === 2 && token) {
            nav("/user", { replace: true })
        }

    }, [nav, role, path])

    useEffect(() => {

        setloading(false)
    }, [])

    const validationSchema = Yup.object({

        email: Yup.string().email('Invalid Email').required('email is required'),
        password: Yup.string()
            .matches(
                lowercaseRegEx,
                "Must contain one lowercase alphabetical character!"
            )
            .matches(
                uppercaseRegEx,
                "Must contain one uppercase alphabetical character!"
            )
            .matches(numericRegEx, "Must contain one numeric character!")
            .matches(lengthRegEx, "Must contain 6 characters!")
            .required("Required!")
    })



    const postlogin = async () => {

        let res = await axiosInstance.post("/user/SignIn", values)
        return res.data;
    }

    const { mutate, isLoading } = useMutation(postlogin, {
        onSuccess: data => {
            //  console.log(data);
            dispatch(LoginAction.Login(data.user));
            localStorage.setItem('token', data.token)

            setsuceessmsg(data.message)
            seterrmsg("");

            if (data.user._id === 1) {
                Toast({ message: `${data.message}` })
                setrole(1)
                nav("/admin", { replace: true })

            }

            if (data.user._id === 2) {
                setrole(2)

                if (values.password.slice(0, 5) === "A@p#1") {

                    Toast({ message: "Reset Your Password" })
                    nav('/resetpass', {
                        state: {
                            pass: values.password,
                            email: values.email
                        }, replace: true
                    })
                }
                else {
                    Toast({ message: "Login Successfully" })
                    nav("/user", {
                        state: {
                            pass: values.password,
                            email: values.email
                        }
                        , replace: true
                    })
                }

            }

        },
        onError: (data) => {
            seterrmsg(data.response.data.message || "Something Wrong");
            setsuceessmsg("");
        },
        onSettled: () => {
            queryClient.invalidateQueries('user Login');
        }
    });


    const handelLogin = () => {
        // console.log(values);
        mutate();

    }



    const { errors, values, handleBlur, handleSubmit, handleChange, touched, dirty, isValid } = useFormik({
        initialValues: {

            email: '',
            password: ''
        },
        validationSchema,
        onSubmit: handelLogin
    })
    return (
        <>
            {/* {console.log("jsx,role", role)} */}
            {loading && <Box sx={{ display: 'flex', mt: 15 }} justifyContent="center">
                <CircularProgress />
            </Box>}
            {!loading && <ThemeProvider theme={theme}>
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <AppBar position="fixed" color="primary" >
                        <Toolbar>
                            <Typography variant="h6">
                                Find Blackilist
                            </Typography>
                        </Toolbar>
                    </AppBar>

                    <Box
                        sx={{
                            marginTop: 11,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >

                        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                            <LoginRoundedIcon></LoginRoundedIcon>
                        </Avatar>

                        <Typography component="h1" variant="h5">
                            Log in
                        </Typography>

                        {errmsg && !suceessmsg && <Alert severity="error" variant='filled' sx={{ mt: 2, mb: 2 }}>{errmsg}</Alert>}
                        {suceessmsg && !errmsg && <Alert severity="success" variant='filled' sx={{ mt: 2, mb: 2 }}>{suceessmsg}</Alert>}

                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }} >
                            <Grid container spacing={2}>

                                <Grid item xs={12}>
                                    <TextField
                                        error={(errors.email && touched.email) ? true : false}
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email Address"
                                        name="email"
                                        autoComplete="email"
                                        value={values.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </Grid>

                                {errors.email && touched.email ? (
                                    <Alert variant='string' severity='error' sx={{ color: '#f44336' }}>{errors.email}</Alert>
                                ) : null}

                                <Grid item xs={12}>
                                    <TextField
                                        type='password'
                                        error={(errors.password && touched.password) ? true : false}
                                        required
                                        fullWidth
                                        id="password"
                                        label="Password"
                                        name="password"
                                        autoComplete="password"
                                        value={values.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </Grid>
                                {errors.password && touched.password ? (
                                    <Alert variant='string' severity='error' sx={{ color: '#f44336' }}>{errors.password}</Alert>
                                ) : null}


                            </Grid>

                            <LoadingButton
                                sx={{ mt: 3, mb: 2 }}
                                disabled={!dirty || !isValid}
                                onClick={handelLogin}
                                fullWidth
                                loading={isLoading}
                                variant="contained"
                                type='submit'
                            >
                                Log In
                            </LoadingButton>

                            <Grid container justifyContent="space-between">
                                <Grid item>
                                    <RouterLink to={"/forgotpass"} style={{
                                        textDecoration: "none", color: "#1976d2"
                                    }}>

                                        <Typography paragraph>
                                            Forgot password
                                        </Typography>
                                    </RouterLink>

                                </Grid>
                                <Grid item>
                                    <Typography paragraph>
                                        <RouterLink to={"/resetpass"} style={{
                                            textDecoration: "none", color: "#1976d2"
                                        }}>

                                            Reset Password

                                        </RouterLink>
                                    </Typography>

                                </Grid>
                            </Grid>
                        </Box>
                    </Box>

                </Container>
            </ThemeProvider>}
        </>
    );
}

export default LogIn;