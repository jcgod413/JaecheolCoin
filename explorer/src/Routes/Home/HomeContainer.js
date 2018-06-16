import React, {
    Component
} from "react";
import PropTypes from "prop-types";
import HomePresenter from "./HomePresenter";

class HomeContainer extends Component {
    render() {
        return <HomePresenter {...this.props} />;
    }
}
HomeContainer.propTypes = {
    blocks: PropTypes.array.isRequired,
    transactions: PropTypes.array.isRequired
};

export default HomeContainer;