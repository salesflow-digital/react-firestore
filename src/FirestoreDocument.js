import { Component } from 'react';
import PropTypes from 'prop-types';
import withFirestore from './withFirestore';

class FirestoreDocument extends Component {
  static propTypes = {
    path: PropTypes.string.isRequired,
    children: PropTypes.func,
    render: PropTypes.func,
    firestore: PropTypes.object.isRequired,
    skip: PropTypes.bool,
  };

  state = {
    isLoading: true,
    data: null,
    error: null,
    snapshot: null,
    skip: false
  };

  componentDidMount() {
    const {skip} = this.props;
    if (skip){
      return;
    }
    this.setupFirestoreListener();
  }

  componentWillUnmount() {
    this.handleUnsubscribe();
  }

  componentWillReceiveProps(nextProps) {
    const {skip} = nextProps;
    if (skip){
      return;
    }
    if (nextProps.path !== this.props.path || skip !==this.props.skip) {
      this.handleUnsubscribe();
      this.setState({ isLoading: true }, () => this.setupFirestoreListener());
    }
  }

  handleUnsubscribe() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  setupFirestoreListener = () => {
    const { firestore, path } = this.props;
    const documentRef = firestore.doc(path);

    this.unsubscribe = documentRef.onSnapshot(
      this.handleOnSnapshotSuccess,
      this.handleOnSnapshotError,
    );
  };

  handleOnSnapshotError = error => {
    this.setState({
      isLoading: false,
      error,
      data: null,
      snapshot: null,
    });
  };

  handleOnSnapshotSuccess = snapshot => {
    if (snapshot) {
      const newState = {
        isLoading: false,
        error: null,
        snapshot,
      };

      try {
        const documentData = snapshot.data();

        if (!snapshot.exists){
          newState.data = null;
        } else {
          newState.data = {
            id: snapshot.id,
            ...documentData,
          };
        }
      } catch (error) {
        newState.error = error;
      }

      this.setState(newState);
    }
  };

  render() {
    const { children, render } = this.props;

    if (render) return render(this.state);

    if (typeof children === 'function') return children(this.state);

    return null;
  }
}

export default withFirestore(FirestoreDocument);
