import React, {
    Component
} from "react";
import PropTypes from "prop-types";
import TransactionsPresenter from "./TransactionsPresenter";

class TransactionsContainer extends Component {
    render() {
        return <TransactionsPresenter {...this.props} />;
    }
}

TransactionsContainer.propTypes = {
    transactions: PropTypes.array.isRequired
};

export default TransactionsContainer;