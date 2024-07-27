import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { supabase } from './utils/supabase';
import LoginPage from './pages/LoginPage';
import SummaryPage from './pages/SummaryPage';
import ProductManagementPage from './pages/ProductManagementPage';
import ActionPage from './pages/ActionPage';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className="App">
        <Header session={session} />
        <Switch>
          <Route exact path="/">
            {session ? <Redirect to="/summary" /> : <LoginPage />}
          </Route>
          <PrivateRoute path="/summary" component={SummaryPage} session={session} />
          <PrivateRoute path="/products" component={ProductManagementPage} session={session} />
          <PrivateRoute path="/actions" component={ActionPage} session={session} />
        </Switch>
        <Footer />
      </div>
    </Router>
  );
}

const PrivateRoute = ({ component: Component, session, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      session ? <Component {...props} session={session} /> : <Redirect to="/" />
    }
  />
);

export default App;