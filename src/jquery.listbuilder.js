/**
 * Created by hsue on 10/27/14.
 */
(function($){
    $.widget( "custom.listBuilder", {
        //Default options
        options: {
            delimiter: ','
        },

        _create: function(){
            this.wrapper = $('<ul class="list-container"><li></li></ul>').appendTo(this.element);
            this.inputField = $('<input>', {
                'type': 'text',
                "class": 'enter-item'
            }).appendTo($('li', this.element));

            this.element.on(
                'keypress paste',
                'li input',
                $.proxy(
                    function (e) {
                        setTimeout((function () {
                            var value = $(e.currentTarget).val();
                            var lastChar = value.charAt(value.length - 1);
                            if(lastChar == this.options['delimiter']) {
                                if(e.currentTarget === this.inputField.get(0)) {
                                    var items = value.split(this.options.delimiter);
                                    items.forEach(
                                        function (item) {
                                            if (item.trim() != '') {
                                                this._validateAndInsert(item, null, false);
                                            }
                                        },
                                        this
                                    );
                                    $(e.currentTarget).val('');
                                }
                                else{
                                    this._finishEditItem(e);
                                }
                            }
                        }).bind(this), 100);
                    },
                    this)
            );

            this.element.on(
                'click',
                '.list-item .item-delete',
                function(e){
                    $(this).parent().remove();
                    e.stopPropagation();
                }
            );

            this.element.on(
                'click',
                '.list-item .item-content',
                this._editItem
            );

            this.element.on(
                'blur',
                'input.edit-item',
                this._finishEditItem.bind(this)
            );

            //
            // A hack to put the cursor at the end of the input field
            //
            this.element.on(
                'focus',
                'input.edit-item',
                function(e){
                    var value = $(this).val();
                    $(this).val(value);
                }
            );

            this.element.on(
                'click',
                (function(e){
                    if(e.currentTarget == this.element[0]){
                        this.inputField.focus();
                    }
                }).bind(this)
            );

        },

        _editItem: function(evt){
            var span = $(evt.currentTarget);
            var li = span.parent();
            var input = $('<input>', {
                type: 'text',
                "class": 'edit-item',
                value: span.text()
            });
            li.empty();
            li.append(input);
            li.removeClass('list-item');
            li.removeClass('invalid');
            input.get(0).focus();
            evt.stopPropagation();

        },

        _finishEditItem: function(evt){
            var input = $(evt.currentTarget);
            var li = input.parent();
            var inputValue = input.val();
            if(inputValue.charAt(inputValue.length - 1) == this.options['delimiter']){
                inputValue = inputValue.substr(0, inputValue.length - 1);
            }
            if(inputValue.trim() == ''){
                li.remove();
            }
            else {
                this._validateAndInsert(inputValue, li, true);
            }
        },

        _validateAndInsert: function(value, liNode, userChange){
            if(!liNode) {
                liNode = $('<li class="list-item"></li>');
                this.inputField.before(liNode);
            }
            else{
                liNode.empty();
                liNode.addClass('list-item');
            }

            liNode.append($('<span>', {
                text: value,
                "class": 'item-content'
            })).append($('<span>', {
                "class": 'icon-close item-delete'
            }));

            var validator = this.options.validatorFn;
            if(validator &&  validator.apply(undefined, [value]) !== true){
                liNode.addClass("invalid");
            }
        },

        values: function(values){
            if(values === undefined) {
                var nodes = $('li.list-item span.item-content', this.element);
                var ret = nodes.map(
                    function () {
                        return $(this).text();
                    }
                ).get();
                return ret;
            }
            $('li.list-item', this.element).remove();
            values.forEach(
                function(value){
                    this._validateAndInsert(value, null, false);
                },
                this
            )
        }


    });
}(jQuery));