import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside';
import { connect } from 'react-redux';
import classnames from 'classnames';

import { getItemsByProperty } from '../../../actions/WindowActions';
import List from '../List/List';
import RawLookup from './RawLookup';

class Lookup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isInputEmpty: true,
      propertiesCopy: getItemsByProperty(props.properties, 'source', 'list'),
      property: '',
      fireClickOutside: false,
      initialFocus: false,
      localClearing: false,
      fireDropdownList: false,
      autofocusDisabled: false,
      isDropdownListOpen: false,
      isFocused: false,
    };
  }

  componentDidMount() {
    this.checkIfDefaultValue();
  }

  checkIfDefaultValue = () => {
    const { defaultValue } = this.props;

    if (defaultValue) {
      defaultValue.map(item => {
        if (item.value) {
          this.setState({
            isInputEmpty: false,
          });
        }
      });
    }
  };

  setNextProperty = prop => {
    const { defaultValue, properties, onBlurWidget } = this.props;

    if (defaultValue) {
      defaultValue.map((item, index) => {
        const nextIndex = index + 1;

        if (
          nextIndex < defaultValue.length &&
          defaultValue[index].field === prop
        ) {
          let nextProp = properties[nextIndex];

          // TODO: Looks like this code was never used
          if (nextProp.source === 'list') {
            this.linkedList.map(listComponent => {
              if (listComponent && listComponent.props) {
                let listProp = listComponent.props.mainProperty;

                if (
                  listProp &&
                  Array.isArray(listProp) &&
                  listProp.length > 0
                ) {
                  const listPropField = listProp[0].field;

                  if (
                    listComponent.activate &&
                    listPropField === nextProp.field
                  ) {
                    listComponent.requestListData(true, true);
                    listComponent.activate();
                  }
                }
              }
            });

            this.setState({
              property: nextProp.field,
            });
          } else {
            this.setState({
              property: nextProp.field,
            });
          }
        } else if (defaultValue[defaultValue.length - 1].field === prop) {
          this.setState(
            {
              property: '',
            },
            () => {
              onBlurWidget && onBlurWidget();
            }
          );
        }
      });
    }
  };

  openDropdownList = () => {
    this.setState(
      {
        fireDropdownList: true,
      },
      () => {
        this.setState({
          fireDropdownList: false,
        });
      }
    );
  };

  dropdownListToggle = value => {
    const { onFocus, onHandleBlur } = this.props;

    this.setState({
      isDropdownListOpen: value,
    });

    if (value && onFocus) {
      onFocus();
    } else if (!value && onHandleBlur) {
      onHandleBlur();
    }
  };

  resetLocalClearing = () => {
    this.setState({
      localClearing: false,
    });
  };

  handleClickOutside = () => {
    if (this.state.isDropdownListOpen) {
      this.setState(
        {
          fireClickOutside: true,
          property: '',
        },
        () => {
          this.setState({
            fireClickOutside: false,
          });
        }
      );
    }
  };

  handleInputEmptyStatus = isEmpty => {
    this.setState({
      isInputEmpty: isEmpty,
    });
  };

  handleClear = () => {
    const { onChange, properties } = this.props;

    if (onChange) {
      onChange(properties, null, false);
    }

    this.setState({
      isInputEmpty: true,
      property: '',
      initialFocus: true,
      localClearing: true,
      autofocusDisabled: false,
    });
  };

  handleFocus = () => {
    this.setState({
      isFocused: true,
    });
    this.props.onFocus();
  };

  handleBlur = () => {
    this.setState({
      isFocused: false,
    });
    this.props.onHandleBlur();
  };

  disableAutofocus = () => {
    this.setState({
      autofocusDisabled: true,
    });
  };

  enableAutofocus = () => {
    this.setState({
      autofocusDisabled: false,
    });
  };

  render() {
    const {
      rank,
      readonly,
      defaultValue,
      placeholder,
      align,
      isModal,
      updated,
      filterWidget,
      mandatory,
      rowId,
      tabIndex,
      validStatus,
      recent,
      onChange,
      newRecordCaption,
      properties,
      windowType,
      parameterName,
      entity,
      dataId,
      tabId,
      subentity,
      subentityId,
      viewId,
      autoFocus,
      newRecordWindowId,
    } = this.props;

    const {
      isInputEmpty,
      property,
      fireClickOutside,
      initialFocus,
      localClearing,
      fireDropdownList,
      autofocusDisabled,
      isFocused,
    } = this.state;

    this.linkedList = [];

    const mandatoryInputCondition =
      mandatory &&
      (isInputEmpty ||
        (validStatus && validStatus.initialValue && !validStatus.valid));
    const errorInputCondition =
      validStatus && (!validStatus.valid && !validStatus.initialValue);
    const classRank = rank || 'primary';

    return (
      <div
        ref={c => (this.dropdown = c)}
        className={classnames(
          'input-dropdown-container lookup-wrapper',
          `input-${classRank}`,
          {
            'pulse-on': updated,
            'pulse-off': !updated,
            'input-full': filterWidget,
            'input-mandatory': mandatoryInputCondition,
            'input-error': errorInputCondition,
            'lookup-wrapper-disabled': readonly,
          }
        )}
      >
        {properties &&
          properties.map((item, index) => {
            const disabled = isInputEmpty && index !== 0;
            const itemByProperty = getItemsByProperty(
              defaultValue,
              'field',
              item.field
            )[0];
            if (
              item.source === 'lookup' ||
              item.widgetType === 'Lookup' ||
              (itemByProperty && itemByProperty.widgetType === 'Lookup')
            ) {
              return (
                <RawLookup
                  key={index}
                  defaultValue={itemByProperty.value}
                  autoFocus={index === 0 && autoFocus}
                  initialFocus={index === 0 && initialFocus}
                  mainProperty={[item]}
                  resetLocalClearing={this.resetLocalClearing}
                  setNextProperty={this.setNextProperty}
                  lookupEmpty={isInputEmpty}
                  fireDropdownList={fireDropdownList}
                  handleInputEmptyStatus={this.handleInputEmptyStatus}
                  enableAutofocus={this.enableAutofocus}
                  onHandleBlur={this.props.onHandleBlur}
                  isOpen={this.state.isDropdownListOpen}
                  onDropdownListToggle={this.dropdownListToggle}
                  {...{
                    placeholder,
                    readonly,
                    tabIndex,
                    windowType,
                    parameterName,
                    entity,
                    dataId,
                    isModal,
                    recent,
                    rank,
                    updated,
                    filterWidget,
                    mandatory,
                    validStatus,
                    align,
                    onChange,
                    item,
                    disabled,
                    fireClickOutside,
                    viewId,
                    subentity,
                    subentityId,
                    tabId,
                    rowId,
                    newRecordCaption,
                    newRecordWindowId,
                    localClearing,
                  }}
                />
              );
            } else if (
              item.source === 'list' ||
              item.widgetType === 'List' ||
              (itemByProperty && itemByProperty.source === 'List')
            ) {
              const isFirstProperty = index === 0;
              const isCurrentProperty =
                item.field === property && !autofocusDisabled;

              return (
                <div
                  key={index}
                  className={classnames(
                    'raw-lookup-wrapper raw-lookup-wrapper-bcg ',
                    {
                      'raw-lookup-disabled': disabled || readonly,
                      focused: isFocused,
                    }
                  )}
                >
                  <List
                    ref={c => {
                      if (c) {
                        this.linkedList.push(c.getWrappedInstance());
                      }
                    }}
                    readonly={disabled || readonly}
                    lookupList={true}
                    autoFocus={isCurrentProperty}
                    doNotOpenOnFocus={false}
                    properties={[item]}
                    mainProperty={[item]}
                    defaultValue={
                      itemByProperty.value ? itemByProperty.value : ''
                    }
                    initialFocus={isFirstProperty ? initialFocus : false}
                    blur={!property ? true : false}
                    setNextProperty={this.setNextProperty}
                    disableAutofocus={this.disableAutofocus}
                    enableAutofocus={this.enableAutofocus}
                    onFocus={this.handleFocus}
                    onHandleBlur={this.handleBlur}
                    {...{
                      dataId,
                      entity,
                      windowType,
                      filterWidget,
                      tabId,
                      rowId,
                      subentity,
                      subentityId,
                      viewId,
                      onChange,
                      isInputEmpty,
                      property,
                    }}
                  />
                </div>
              );
            }
          })}

        {!readonly &&
          (isInputEmpty ? (
            <div
              className="input-icon input-icon-lg raw-lookup-wrapper"
              onClick={this.openDropdownList}
            >
              <i className="meta-icon-preview" />
            </div>
          ) : (
            <div className="input-icon input-icon-lg raw-lookup-wrapper">
              <i className="meta-icon-close-alt" onClick={this.handleClear} />
            </div>
          ))}
      </div>
    );
  }
}

export default connect()(onClickOutside(Lookup));
