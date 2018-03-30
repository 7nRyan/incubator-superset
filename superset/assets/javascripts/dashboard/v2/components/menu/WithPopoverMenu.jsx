import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const propTypes = {
  children: PropTypes.node,
  disableClick: PropTypes.bool,
  menuItems: PropTypes.arrayOf(PropTypes.node),
  onChangeFocus: PropTypes.func,
  isFocused: PropTypes.bool,
  shouldFocus: PropTypes.func,
};

const defaultProps = {
  children: null,
  disableClick: false,
  onChangeFocus: null,
  onPressDelete() {},
  menuItems: [],
  isFocused: false,
  shouldFocus: (event, container) => container.contains(event.target),
};

class WithPopoverMenu extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isFocused: props.isFocused,
    };
    this.setRef = this.setRef.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isFocused && !this.state.isFocused) {
      document.addEventListener('click', this.handleClick, true);
      document.addEventListener('drag', this.handleClick, true);
      this.setState({ isFocused: true });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick, true);
    document.removeEventListener('drag', this.handleClick, true);
  }

  setRef(ref) {
    this.container = ref;
  }

  handleClick(event) {
    const { onChangeFocus, shouldFocus: shouldFocusThunk } = this.props;
    const shouldFocus = shouldFocusThunk(event, this.container);

    if (shouldFocus && !this.state.isFocused) {
      // if not focused, set focus and add a window event listener to capture outside clicks
      // this enables us to not set a click listener for ever item on a dashboard
      document.addEventListener('click', this.handleClick, true);
      document.addEventListener('drag', this.handleClick, true);
      this.setState(() => ({ isFocused: true }));
      if (onChangeFocus) {
        onChangeFocus(true);
      }
    } else if (!shouldFocus && this.state.isFocused) {
      document.removeEventListener('click', this.handleClick, true);
      document.removeEventListener('drag', this.handleClick, true);
      this.setState(() => ({ isFocused: false }));
      if (onChangeFocus) {
        onChangeFocus(false);
      }
    }
  }

  render() {
    const { children, menuItems, disableClick } = this.props;
    const { isFocused } = this.state;

    return (
      <div
        ref={this.setRef}
        onClick={!disableClick && this.handleClick}
        role="none"
        className={cx(
          'with-popover-menu',
          isFocused && 'with-popover-menu--focused',
        )}
      >
        {children}
        {isFocused && menuItems.length ?
          <div className="popover-menu" >
            {menuItems.map((node, i) => (
              <div className="menu-item" key={`menu-item-${i}`}>{node}</div>
            ))}
          </div> : null}
      </div>
    );
  }
}

WithPopoverMenu.propTypes = propTypes;
WithPopoverMenu.defaultProps = defaultProps;

export default WithPopoverMenu;