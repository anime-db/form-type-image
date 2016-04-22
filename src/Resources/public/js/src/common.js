/**
 * AnimeDb package
 *
 * @package   AnimeDb
 * @author    Peter Gribanov <info@peter-gribanov.ru>
 * @copyright Copyright (c) 2016, Peter Gribanov
 * @license   http://opensource.org/licenses/MIT
 */

(function($){

    var extend = function(Child, Parent) {
        var F = function() {};
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.prototype.constructor = Child;
        Child.superclass = Parent.prototype;
    };



    /**
     * Controller control
     * @constructor
     */
    var ControllerControl = function() {
        this._controller = null; // private
    };
    ControllerControl.prototype = {
        setController: function(controller) {
            this._controller = controller;
        },
        getController: function() {
            return this._controller;
        },
        bind: function(target) {
            throw new Error('Must be implemented');
        }
    };



    /**
     * Controller
     * @param token
     * @constructor
     */
    var Controller = function(token) {
        this._controls = []; // private
        this._token = token; // private
    };
    Controller.prototype = {
        addControl: function(name, control) {
            if (control instanceof ControllerControl) {
                control.setController(this);
                this._controls[name] = control;
            }
        },
        bindControl: function(target) {
            var name = target.data('control');
            if (this._controls[name] instanceof ControllerControl) {
                this._controls[name].bind(target);
            }
        },
        bind: function(target) {
            target = $(target || 'body');

            if (target.data('control')) {
                this.bindControl(target);
            } else {
                var that = this;
                target.find('[data-control]').each(function () {
                    that.bindControl($(this));
                });
            }
        },
        getToken: function() {
            return this._token;
        }
    };



    /**
     * Util for get CSRF token
     * @constructor
     */
    var UtilFormToken = function() {
        this._token = ''; // private
        this._url = ''; // private
        this._wait = false; // private
    };
    UtilFormToken.prototype = {
        getToken: function() {
            return this._token;
        },
        setUrl: function(url) {
            this._url = url;
            if (url && !this._token) {
                this.refreshToken();
            }
        },
        refreshToken: function(callback) {
            if (!this._wait && this._url) {
                this._wait = true;
                var that = this;
                $.ajax({
                    url: this._url,
                    type: 'POST',
                    dataType: 'text',
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        that._token = response;
                        that._wait = false;
                        (callback || function () {})();
                    },
                    complete: function() {
                        that._wait = false;
                    }
                });
            }
        }
    };



    /**
     * Upload image container
     * @param target
     * @param control
     * @constructor
     */
    var ControlUploadImageContainer = function(target, control) {
        this._control = control; // private
        this.image = null;
        this.input = null;
        this.file = null;
        this.container = target;
        this.path = target.data('upload-path');
        this.error = $('<div class="upload-image__alert alert alert-danger" role="alert"></div>').hide();
        this.container.after(this.error);
    };
    ControlUploadImageContainer.prototype = {
        init: function() {
            this.image = this.container.find('img');
            this.input = this.container.find('input[type=text]');
            this.file = this.container.find('input[type=file]');

            var that = this;
            this.fileDropBlock();
            this.file.on('change', function () {
                that.doUpload(this.files[0]);
            });
        },
        /**
         * FileDrop upload
         * @link https://github.com/weixiyen/jquery-filedrop
         */
        fileDropBlock: function() {
            var that = this;
            this.container.filedrop({
                url: that.path,
                paramname: 'form[file]',
                data: {
                    form: {
                        _token: function() {
                            return that._control.getController().getToken().getToken();
                        }
                    }
                },
                maxfiles: 1,
                maxfilesize: 2, // max file size in MB
                error: function (err, file) {
                    switch (err) {
                        case 'BrowserNotSupported':
                            that.showError('Старый браузер');
                            break;
                        case 'FileTooLarge':
                            that.showError('Файл слишком большой');
                            break;
                        case 'TooManyFiles':
                            that.showError('Можно загрузить только 1 файл');
                            break;
                        case 'FileTypeNotAllowed':
                            that.showError('Некорректный тип файла');
                            break;
                        default:
                            that.showError('Не удалось загрузить картинку');
                    }
                },
                allowedfiletypes: ['image/jpeg', 'image/png', 'image/gif'],
                allowedfileextensions: ['.jpg', '.jpeg', '.png', '.gif'],
                dragOver: function () {
                    that.container.addClass('upload-image_dragging');
                },
                dragLeave: function () {
                    that.container.removeClass('upload-image_dragging');
                },
                uploadStarted: function () {
                    that.container.removeClass('upload-image_dragging');
                    that.error.hide();
                },
                uploadFinished: function (i, file, response) {
                    that.setInputValueFromResponse(response);
                }
            });
        },
        /**
         * Upload for click on file input
         * @param file
         */
        doUpload: function(file) {
            this.error.hide();
            var reader;

            if (window.FormData) {
                formdata = new FormData();
            }

            if (window.FileReader) {
                reader = new FileReader();
                reader.readAsDataURL(file);
            }

            if (formdata) {
                formdata.append('form[file]', file);
                formdata.append('form[_token]', this._control.getController().getToken().getToken());
            }

            if ($.inArray(file.type, ['image/jpeg', 'image/png', 'image/gif']) != -1) {
                var that = this;
                $.ajax({
                    url: that.path,
                    type: 'POST',
                    data: formdata,
                    dataType: 'json',
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        if (response.status == 0) {
                            that.showError(response.message);
                        } else {
                            that.setInputValueFromResponse(response);
                        }
                        that._control.getController().getToken().refreshToken();
                    }
                });
            } else {
                this.showError('Неправельный тип файла');
            }
            this.file.blur();
        },
        setInputValueFromResponse: function(response) {
            this.input.val(response.filename);
            this.image.attr('src', response.web_path);
        },
        showError: function(message) {
            console.error(message);
            this.error.text(message).show();
        }
    };



    /**
     * Control upload image
     * @constructor
     */
    var ControlUploadImage = function() {
    };
    extend(ControlUploadImage, ControllerControl);
    ControlUploadImage.prototype.bind = function(target) {
        this._controller.getToken().setUrl(target.data('generate-token'));

        (new ControlUploadImageContainer(target, this)).init();
    };



    /**
     * Upload image collection container
     * @param target
     * @param control
     * @constructor
     */
    var ControlUploadImageCollectionContainer = function(target, control) {
        this._control = control; // private
        this._drop_block = target.find(target.data('drop-block')); // private
        this._single_upload_path = target.data('single-upload-path'); // private
        this._milti_upload_path = target.data('milti-upload-path'); // private
        this._limit = target.data('upload-limit'); // private
        this._container = target.find(target.data('container')); // private
        this._file = this._drop_block.find('input[type=file]'); // private
        this._error = $('<div class="form-image-collection__alert alert alert-danger" role="alert"></div>').hide(); // private
    };
    ControlUploadImageCollectionContainer.prototype = {
        init: function () {
            this._drop_block.before(this._error);

            var that = this;
            this.fileDropBlock();
            this._file.on('change', function () {
                that.doUpload(this);
            });
        },
        /**
         * FileDrop upload
         * @link https://github.com/weixiyen/jquery-filedrop
         */
        fileDropBlock: function () {
            var that = this;
            this._drop_block.filedrop({
                url: that._single_upload_path,
                paramname: 'form[file]',
                data: {
                    form: {
                        _token: function () {
                            return that._control.getController().getToken().getToken();
                        }
                    }
                },
                maxfiles: this._limit,
                maxfilesize: 2, // max file size in MB
                error: function (err, file) {
                    switch (err) {
                        case 'BrowserNotSupported':
                            that.showError('Старый браузер');
                            break;
                        case 'FileTooLarge':
                            that.showError('Файлы слишком большие');
                            break;
                        case 'TooManyFiles':
                            that.showError('Можно загрузить только ' + that._limit + ' файлов');
                            break;
                        case 'FileTypeNotAllowed':
                            that.showError('Некорректный тип файлов');
                            break;
                        default:
                            that.showError('Не удалось загрузить картинки');
                    }
                },
                allowedfiletypes: ['image/jpeg', 'image/png', 'image/gif'],
                allowedfileextensions: ['.jpg', '.jpeg', '.png', '.gif'],
                dragOver: function () {
                    that._drop_block.addClass('form-image-collection_dragging');
                },
                dragLeave: function () {
                    that._drop_block.removeClass('form-image-collection_dragging');
                },
                uploadStarted: function () {
                    that._drop_block.removeClass('form-image-collection_dragging');
                    that._error.hide();
                },
                uploadFinished: function (i, file, response) {
                    that.addFile(response);
                },
                afterAll: function () {
                    that._control.getController().getToken().refreshToken();
                }
            });
        },
        /**
         * Upload for click on file input
         */
        doUpload: function (input_file) {
            this._error.hide();
            if (!input_file.files.length) {
                return;
            }

            if (input_file.files.length > this._limit) {
                this.showError('Можно загрузить только ' + this._limit + ' файлов');
                return;
            }

            var formdata = window.FormData ? new FormData() : null;
            var reader, file;

            for (var i = 0; i < input_file.files.length; i++) {
                file = input_file.files[i];
                if (window.FileReader) {
                    reader = new FileReader();
                    reader.readAsDataURL(file);
                }

                if (formdata && $.inArray(file.type, ['image/jpeg', 'image/png', 'image/gif']) != -1) {
                    formdata.append('form[files][]', file);
                }
            }

            if (formdata) {
                formdata.append('form[_token]', this._control.getController().getToken().getToken());
                var that = this;
                $.ajax({
                    url: that._milti_upload_path,
                    type: 'POST',
                    data: formdata,
                    dataType: 'json',
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        if (response.status == 1) {
                            that.addFiles(response.files);
                        } else {
                            that.showError(response.message);
                        }
                        that._control.getController().getToken().refreshToken();
                    },
                    error: function () {
                        that.showError('Не удалось загрузить картинки');
                    }
                });
            } else {
                this.showError('Неправельный тип файла');
            }
            this._file.blur();
        },
        addFiles: function (files) {
            for (var i = 0; i < files.length; i++) {
                this.addFile(files[i]);
            }
        },
        addFile: function (file) {
            this._container.find('.sonata-collection-add').trigger('click');
            // set data
            var row = this._container.find('.sonata-collection-row:last');
            row.find('.upload-image input[type=text]').val(file.filename);
            row.find('.upload-image img').attr('src', file.web_path);
            this._control.getController().bind(row);
        },
        showError: function (message) {
            console.error(message);
            this._error.text(message).show();
            this._file.blur();
        }
    };



    /**
     * Control upload image collection
     * @constructor
     */
    var ControlUploadImageCollection = function() {
    };
    extend(ControlUploadImageCollection, ControllerControl);
    ControlUploadImageCollection.prototype.bind = function(target) {
        this._controller.getToken().setUrl(target.data('generate-token'));

        (new ControlUploadImageCollectionContainer(target, this)).init();
    };



    // init Controller and add controls
    var cont = new Controller(new UtilFormToken());
    cont.addControl('form-image', new ControlUploadImage());
    cont.addControl('form-image-collection', new ControlUploadImageCollection());

    $(function(){
        cont.bind();

        // bind on add element from Sonata
        $('div[id^=sonata-ba-field-container-]').on('sonata.add_element', function(event) {
            cont.bind(event.target);
        });
        $('div[id$=collection__container]').on('sonata-collection-item-added', function(event) {
            cont.bind(event.target);
        });
    });

})(jQuery);
