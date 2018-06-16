import React, { Fragment } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { makeDateCool } from "../../utils";
import {
    Card,
    BlocksHeader,
    BlocksRow
} from "Components/Shared";

const TableContainer = styled.div`
  margin-top: 50px;
  margin-bottom: 100px;
`;

const BlocksPresenter = ({ blocks }) => (
    <Fragment>
      <TableContainer>
        <h2>Blocks</h2>
        <Card>
          <BlocksHeader />
          {blocks.map((block, index) => (
            <BlocksRow
              index={block.index}
              hash={block.hash}
              timestamp={makeDateCool(block.timestamp)}
              difficulty={block.difficulty}
              key={index}
            />
          ))}
        </Card>
      </TableContainer>
  </Fragment>
);

BlocksPresenter.propTypes = {
    blocks: PropTypes.array.isRequired
};  

export default BlocksPresenter;