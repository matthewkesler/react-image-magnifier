'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');

var Magnifier = React.createClass({
    displayName: 'Magnifier',

    propTypes: {

        // the size of the magnifier window
        size: React.PropTypes.number.isRequired,

        // x position on screen
        x: React.PropTypes.number.isRequired,

        // y position on screen
        y: React.PropTypes.number.isRequired,

        // x position relative to the image
        offsetX: React.PropTypes.number.isRequired,

        // y position relative to the image
        offsetY: React.PropTypes.number.isRequired,

        // the offset of the zoom bubble from the cursor
        cursorOffset: React.PropTypes.shape({
            x: React.PropTypes.number.isRequired,
            y: React.PropTypes.number.isRequired
        }).isRequired,

        // the size of the non-zoomed-in image
        smallImage: React.PropTypes.shape({
            src: React.PropTypes.string.isRequired,
            width: React.PropTypes.number.isRequired,
            height: React.PropTypes.number.isRequired
        }).isRequired,

        // the size of the zoomed-in image
        zoomImage: React.PropTypes.shape({
            src: React.PropTypes.string.isRequired,
            width: React.PropTypes.number.isRequired,
            height: React.PropTypes.number.isRequired
        }).isRequired,

        onClick: React.PropTypes.func
    },

    handleClick: function() {
        if(this.props.onClick) {
            this.props.onClick();
        }
    },

    render: function render() {
        var _this = this;
        var props = this.props;
        var halfSizeY = props.size / 2;
        var halfSizeX = (props.size + (props.size * .4)) / 2;
        var magX = props.zoomImage.width / props.smallImage.width;
        var magY = props.zoomImage.height / props.smallImage.height;
        var bgX = -(props.offsetX * magX - halfSizeX);
        var bgY = -(props.offsetY * magY - halfSizeY);
        var isVisible = props.offsetY < props.smallImage.height && props.offsetX < props.smallImage.width && props.offsetY > 0 && props.offsetX > 0;
        return React.createElement(
            'div',
            { style: {
                    position: 'absolute',
                    display: isVisible ? 'block' : 'none',
                    top: props.y,
                    left: props.x,
                    width: props.size + (props.size * .4),
                    height: props.size,
                    marginLeft: -halfSizeX + props.cursorOffset.x,
                    marginTop: -halfSizeY + props.cursorOffset.y,
                    backgroundColor: 'white',
                    boxShadow: '1px 1px 6px rgba(0,0,0,0.3)',
                } },
            React.createElement('div', {
                style: {
                    width: props.size + (props.size * .4),
                    height: props.size,
                    backgroundImage: 'url(' + props.zoomImage.src + ')',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: bgX + 'px ' + bgY + 'px',
                    border: '4px solid #77c2e6'

                },
                onClick: _this.handleClick
            })
        );
    }
});

function getOffset(el) {
    var x = 0;
    var y = 0;

    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        // FF & IE don't support body's scrollTop - use window instead
        x += el.offsetLeft - (el.tagName === 'BODY' ? window.pageXOffset : el.scrollLeft);
        y += el.offsetTop - (el.tagName === 'BODY' ? window.pageYOffset : el.scrollTop);
        el = el.offsetParent;
    }

    return { x: x, y: y };
}

var ImageMagnifier = React.createClass({
    displayName: 'ImageMagnifier',

    propTypes: {

        // the size of the magnifier window
        size: React.PropTypes.number,

        // the offset of the zoom bubble from the cursor
        cursorOffset: React.PropTypes.shape({
            x: React.PropTypes.number.isRequired,
            y: React.PropTypes.number.isRequired
        }),

        // the size of the non-zoomed-in image
        image: React.PropTypes.shape({
            src: React.PropTypes.string.isRequired,
            width: React.PropTypes.number.isRequired,
            height: React.PropTypes.number.isRequired
        }).isRequired,

        // the size of the zoomed-in image
        zoomImage: React.PropTypes.shape({
            src: React.PropTypes.string.isRequired,
            width: React.PropTypes.number.isRequired,
            height: React.PropTypes.number.isRequired
        }).isRequired,

        onClick: React.PropTypes.func
    },

    portalElement: null,

    getDefaultProps: function getDefaultProps() {
        return {
            size: 200,
            cursorOffset: { x: 0, y: 0 }
        };
    },

    getInitialState: function getInitialState() {
        return {
            x: 0,
            y: 0,
            offsetX: -1,
            offsetY: -1
        };
    },

    componentDidMount: function componentDidMount() {
        document.addEventListener('mousemove', this.onMouseMove);
        if (!this.portalElement) {
            this.portalElement = document.createElement('div');
            document.body.appendChild(this.portalElement);
        }
        this.componentDidUpdate();
    },

    componentWillUnmount: function componentWillUnmount() {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.body.removeChild(this.portalElement);
        this.portalElement = null;
    },

    onMouseMove: function onMouseMove(e) {
        var offset = getOffset(this.getDOMNode());

        var scrollX = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
        var scrollY = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;

        this.setState({
            x       : e.clientX + scrollX, //(window.scrollX || window.pageXOffset),
            y       : e.clientY + scrollY, //(window.scrollY || window.pageYOffset),
            offsetX : e.clientX - offset.x,
            offsetY : e.clientY - offset.y
        });
    },

    handleClick: function(e) {
        if(this.props.onClick) {
            this.props.onClick();
        }
    },

    componentDidUpdate: function componentDidUpdate() {
        React.render(React.createElement(Magnifier, _extends({
            size: this.props.size,
            smallImage: this.props.image,
            zoomImage: this.props.zoomImage,
            cursorOffset: this.props.cursorOffset,
            onClick: this.handleClick
        }, this.state)), this.portalElement);
    },

    render: function render() {
        var _this = this;
        return React.createElement('img', _extends({}, this.props, { src: this.props.image.src }));
    }
});

module.exports = ImageMagnifier;
