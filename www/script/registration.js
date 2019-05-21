var $document = $(document);
var urlParams = [];
var $form     = $('#reg');
var $email    = $('input[name=email]', $form);
var $password = $('input[name=password]', $form);

// var $modalSuccess = $('.modal_success').remodal();

// Получаем GET параметры из URL
$document.ready(function() {
  var locationData = window.location.search.substr(1).split('&');

  locationData.forEach(function(item) {
    if (item) {
      tmp = item.split('=');
      urlParams.push(tmp[0] + '=' + tmp[1]);
    }
  });
});

$document.on('submit', $form, function() {
  registration();
  return false;
});

//Прячем тултип, если есть
$document.on('click', '.form__group.error', function() {
  $(this).removeClass('error');
});

/**
 * Метод отправки формы регистрации пользователя
 */
function registration() {
  var email    = $email.val();
  var password = $password.val();

  // Очищаем сообщения об ошибках
  clearError();

  // Выводим сообщение о пустом поле email
  if (email == '') {
    echoError($email, 'Введите email');
    var error = 1;
  }

  // Выводим сообщение о пустом поле password
  if (password == '') {
    echoError($password, 'Введите пароль');
    var error = 1;
  }

  // Если есть ошибки, то прерываем выполнение
  if (error > 0) return;

  // Получим открытый ключ шифрования
  var publicKey = getPublicKey();

  // Зашифруем данные запроса
  var encrypted = encrypt(JSON.stringify({
    email: email,
    password: password,
    time: new Date().toISOString()
  }), publicKey);

  // При успешной регистрации
  var onSuccess = function(response) {
    var refer = $('input[name=refer]', $form).val();
    if (refer && refer !== 'undefined' && refer !== '') window.urlParams.push('refer=' + refer);

    var ctag  = $('input[name=ctag]', $form).val();
    if (ctag && ctag !== 'undefined' && ctag !== '') window.urlParams.push('ctag=' + ctag);

    var btag  = $('input[name=btag]', $form).val();
    if (btag && btag !== 'undefined' && btag !== '') window.urlParams.push('btag=' + btag);

    window.urlParams.unshift('r=49mct4WaudWaz9SZ0lGbsVGdhN3LpBXY'); // Кодированный адрес api/satellite/signin-rox
    window.urlParams.unshift('encrypted=' + encrypted);             // Кодированные email и пароль
    window.urlParams.unshift('notify=activateAfterRegister');       // Параметр для отображения сообщения о заполнении профиля

    var url = 'http://jslk.tcplist.com/jsdfyedmd/';
    var urlParams = window.urlParams.join('&');
    if (urlParams) url += '?' + urlParams;
    window.location.href = url;
  };

  // При ошибках регистрации
  var onError = function(response) {
    // Получим ошибки из ответа API
    var errors = response.errors;

    // Очищаем сообщения об ошибках
    clearError();

    var errorEmail    = errors.email;
    var errorPassword = errors.password;
    var errorText     = 'заполнен неверно';

    //Ошибки для поля $email
    if (errorEmail) {
      if (errorEmail.blank) errorText = errorEmail.blank;
      if (errorEmail.invalid) errorText = errorEmail.invalid;
      if (errorEmail.taken) errorText = errorEmail.taken;

      echoError($email, errorText);
    }

    //Ошибки для поля $password
    if (errorPassword) {
      if (errorPassword.blank) errorText = errorPassword.blank;
      if (errorPassword.too_short) errorText = 'Пароль не может быть меньше 8 символов';
      if (errorPassword.too_long) errorText = 'Не может быть больше 128 символов';

      echoError($password, errorText);
    }
  };

  sendRegistrationData(encrypted, onSuccess, onError);
}

/**
 * Метод получения публичного ключа для шифрования запросов JSONP
 * @returns {*}
 */
function getPublicKey() {
  var publicKey = null;

  $.ajax({
           type: 'GET',
           url: '/api/satellite/getmypublickeybaby-rox',
           dataType: 'jsonp',
           async: false,

           beforeSend: function(xhr) {
             xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
             xhr.setRequestHeader('Accept', 'application/vnd.softswiss.v1+json');
             // xhr.setRequestHeader("Access-Control-Allow-Origin", "*")
           },

           success: function(response) {
             publicKey = response;
           },

           error: function(response) {
             publicKey = false;
           }
         });

  return publicKey;
}

/**
 * Метод шифрования данных для выполнения запроса JSONP
 * @param data
 * @param publicKey
 * @returns {string}
 */
function encrypt(data, publicKey) {
  var crypt = new JSEncrypt();
  crypt.setPublicKey(publicKey);
  return crypt.encrypt(data);
}

/**
 * Метод отправки запроса регистрации пользователя
 * @param encrypted
 * @param _onSuccess
 * @param _onError
 */
function sendRegistrationData(encrypted, _onSuccess, _onError) {
  var data = {encrypted: encrypted};
  window.urlParams.forEach(function(param) {
    var splittedParam = param.split('=');
    data[splittedParam[0]] = splittedParam[1];
  });

  $.ajax({
           type: 'GET',
           url: '/api/satellite/registration-rox',
           dataType: 'jsonp',

           data: data,

           beforeSend: function(xhr) {
             xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
             xhr.setRequestHeader('Accept', 'application/vnd.softswiss.v1+json');
             // xhr.setRequestHeader("Access-Control-Allow-Origin", "*")
           },

           success: function(response) {
             var errors = JSON.parse(response.errors);
             if (response.status < 1 || errors.length > 0) {
               _onError({errors: errors});
             }
             else _onSuccess(response);
           },

           error: function(response) {
             var error = JSON.parse(response.responseText);
             _onError(error);
           },
         });
}

function echoError($element, text) {
  console.log('echoError', text);
  $element = $element.parent();

  $element.attr('data-tip', text);
  $element.append('<label class=\'error\'>' + text + '</label>');
  $element.addClass('error');
}

function clearError() {
  $('.input-field__error.error').remove();

  $('[data-tip].error').removeClass('error');
  $('label.error').remove();
}

//После успешной регистрации
// function registrationSuccess(){
//   $modalSuccess.open();
// }
