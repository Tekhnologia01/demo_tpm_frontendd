const handleSubmit = async (values: typeof initialValues, { setSubmitting }: any) => {
  try {
    setGeneralError('');
    const apiUrl = import.meta.env.REACT_APP_API_URL;

    const response = await axios.post(`${apiUrl}/userlogin`, {
      email: values.email,
      password: values.password,
    });

    const { token } = response.data;

    localStorage.setItem('token', token);

    const decodedToken = jwtDecode(token);
    console.log('Decoded Token:', decodedToken);

    dispatch(setUser(decodedToken));
    navigate('/');
  } catch (err: any) {
    setGeneralError(err.response?.data?.message || 'Invalid credentials');
  } finally {
    setSubmitting(false);
  }
};
