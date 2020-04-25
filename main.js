const URL = 'https://6nrr6n9l50.execute-api.us-east-1.amazonaws.com/default/front-plantTest-service';

function check(elem_class) {
    let result_array = [];

    $.each($(`${elem_class}`), function () {
        let text = $(this).text().trim();

        if (text != 'Select...') {
            let filtered_result = filter_array(text);

            result_array.push(filtered_result);
        }
    });

    // if all of the selects are selected
    if (result_array.length == 3)
        show_recom(result_array);
}

const filter_array = str => str.split(' ')[0].toLowerCase();

// make dropdown work
$('.dropdown--container').find('.dropdown').click(function () {
    $(this).toggleClass('dropdown--border');
    $(this).find('ul').toggleClass('dropdown--active');
});

// change dropdown text
$('.dropdown--container').find('ul > li').click(function () {
    $(this).parents('.dropdown').children('p').html($(this).text());

    check('.dropdown p');
});


// show recommendation boxes
const show_recom = arr => {
    let sun = arr[0];
    let water = arr[1];
    let pets = arr[2] === 'yes';

    // make request to server
    $.ajax({
        url: URL,
        type: 'GET',
        data: {
            sun,
            water,
            pets,
        },
        success: function (data) {
            /* i could filter it to return data with the EXACTLY three things user selected,
            but the chance to return something is really low. */

            delete_child(document.getElementById('pick--container')); // remove childs before insert new ones
            toggleElements($('.no-result'), $('.result'), 'block'); // remove 'No results yet' and show result boxes.

            data.forEach(item => create_box(item));
        },
        error: err =>
            err.readyState == 4 ? alert(`I didn't find any plant!`) : alert(`Something went wrong :(`)
    });
};

const toggleElements = (element_remove, element_show, display) => (element_remove.css('display', 'none'), element_show.css('display', display));

// create new box with result
function create_box(data) {
    const $new_box = give_class('section', 'pick--box')
    const $new_image = give_class('div', 'pick--image')
    const $new_title = give_class('div', 'pick--title')
    const $new_container = give_class('section', 'pick--details')
    const $new_price = give_class('p', 'pick--price__text')
    const $new_icon = give_class('span', 'details--icon')

    $new_container.append($new_price, $new_icon);
    $new_box.append($new_image, $new_title, $new_container);

    // return new box (and data)
    return config_box($new_box, data);
}

const give_class = (element, class_name) => {
    let elem = document.createElement(element);
    elem.className = class_name;

    // return new element with class_name as class
    return elem;
}

function config_box(box, data) {
    // change image
    box.querySelector(`.${box.className} > .pick--image`).style.backgroundImage = `url(${data.url})`;
    // change name
    box.querySelector(`.${box.className} > .pick--title`).innerHTML = data.name;
    // change price
    box.querySelector(`.${box.className} > .pick--details > p`).innerHTML = `$${data.price}`;
    // change icon (by it's source)
    let water_icon = create_image('water', data) || 0;
    let sun_icon = create_image('sun', data) || 0;
    let toxicity_icon = create_image('toxicity', data) || 0;

    box.querySelector(`.${box.className} > .pick--details > span`).append(water_icon, sun_icon, toxicity_icon);

    // append box to container
    return $('#pick--container').append(box);
}

// recursion to delete childs before append new ones
const delete_child = elem => elem.lastChild ? (elem.lastChild.remove(), delete_child(elem)) : 0;

// create <img /> element with icon's source
const create_image = (parameter, data) => {
    let elem = document.createElement('img');
    elem.src = check_icon({
        param: parameter,
        data: data
    }) || '';

    return elem || 0;
}

// check it's parameter and return icon's source
function check_icon({
    param,
    data
}) {
    let icon_source = {
        'high': './icon/HighSun.svg',
        'low': './icon/LowSun.svg',
        'no': './icon/NoSun.svg',
        'rarely': './icon/OneDrop.svg',
        'regularly': './icon/TwoDrops.svg',
        'daily': './icon/ThreeDrops.svg',
        'true': './icon/Toxic.svg',
        // 'false': '' // don't think i need this one
    }

    // return icon's source
    return icon_source[data[param]] || 0;
}
