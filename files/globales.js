/* Dependences */
var MaxAndMinController = require("../base/MaxAndMinController");
var Vitrine = require("../base/vitrine");

var generales = (function () {
    var email = "";

    var init = function () {
        getDataUserSession();
        funcionesGenerales();
        MaxAndMinController.init(email);
        Vitrine.init();
        funcionesHeader();
        funcionesFooter();
        showPrincipalPopUp();
        localStorage.setItem("validateReload", "");
    };

    var getDataUserSession = function () {
        var searchedForData = false;
        $(window).on("orderFormUpdated.vtex", function (evt, orderForm) {
            if (orderForm.clientProfileData && orderForm.clientProfileData.email) {
                email = orderForm.clientProfileData.email;

                if (
                    !searchedForData ||
                    (!searchedForData &&
                        !orderForm.clientProfileData.firstName &&
                        !orderForm.clientProfileData.lastName &&
                        !orderForm.clientProfileData.document &&
                        !orderForm.clientProfileData.phone)
                ) {
                    searchedForData = true;
                    getDataUserFromVTEX(email, orderForm);
                }
                $(".contentPreLoading").hide();
            } else {
                if (!$(".contentPreLoading").length) {
                    $("body").append(
                        "<div class='contentPreLoading'><img class='imgGif' src='/arquivos/imgGif.png'></img><img class='imgPreUpload' src='/arquivos/imgValidInfoLogin.png'></img></div>"
                    );
                }
                signOutSession(getLoginURL());
            }
        });

        vtexjs.checkout.getOrderForm();
    };

    var getLoginURL = function () {
        const returnURL = encodeURIComponent(window.location.href.replace(window.location.origin, ""));
        return "/?ReturnUrl=" + returnURL;
    };

    var getDataUserFromVTEX = function (email, orderForm) {
        $.get(
            `/api/dataentities/CL/search?_fields=firstName,lastName,phone,document,company,referrer,referred,estadoUsuario&_where=email=${email}`
        )
            .done((res) => {
                if (res.length === 0) {
                    signOutSession(getLoginURL());
                } else {
                    var clientProfileData = orderForm.clientProfileData;
                    clientProfileData.firstName = res[0].firstName;
                    clientProfileData.lastName = res[0].lastName;
                    clientProfileData.document = res[0].document;
                    clientProfileData.phone = res[0].phone;

                    $(document).trigger("enhancedController:company", [res[0].company]);
                    $(document).trigger("PopUp:clientInfo", res);

                    vtexjs.checkout.sendAttachment("clientProfileData", clientProfileData).done(function (orderForm) {
                        $(document).trigger("cartSummary:reloadCart", [false, orderForm]);
                    });
                }
            })
            .fail((error) => {
                console.error(error);
            });
    };

    var signOutSession = (page) => {
        $.get("/no-cache/user/logout")
            .done(() => {
                $.get(vtexjs.checkout.getLogoutURL());
                location.replace(page);
            })
            .fail((err) => {
                console.error(err);
            });
    };

    var funcionesGenerales = function () {
        $(document).on("BuyButton:productAddedToCart", function (e, productAdded, orderForm, source) {
            $("#cart-loader").addClass("active");
            $(document).trigger("cartSummary:reloadCart", [true, orderForm]);
        });
    };

    var funcionesHeader = function () {
        $(function () {
            $(document).ready(function () {
                if ($(window).scrollTop() <= 10) {
                    $(".headerNew ").removeClass("stiky-header");
                    $(".headerNew ").addClass("normal");
                } else {
                    $(".headerNew ").addClass("stiky-header");
                    $(".headerNew ").removeClass("normal");
                }
                $(window).scroll(function () {
                    if ($(window).scrollTop() <= 10) {
                        $(".headerNew ").removeClass("stiky-header");
                        $(".headerNew ").addClass("normal");
                    } else {
                        $(".headerNew ").addClass("stiky-header");
                        $(".headerNew ").removeClass("normal");
                    }
                });

                $(".category-title-mobile").on("click", function () {
                    $(".category-list").addClass("category-list-show");
                });

                $(".go-back-menu").on("click", function () {
                    $(".category-list").removeClass("category-list-show");
                });

                $(".category-list").on("click", "li", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    $(this).siblings().removeClass("category-active");
                    $(this).siblings().find("ul").slideUp();

                    var toggleState = $(this).find("ul").is(":hidden");
                    $(this).find("ul").slideToggle();

                    if (!toggleState) {
                        $(this).removeClass("category-active");
                    } else {
                        $(this).addClass("category-active");
                    }
                });

                var categories = $(".optionmenuheader");

                categories.each(function (index, category) {
                    var $categoryName = $(category).find(".subCategoriesContainer .CategoriesName a").text();
                    var $subcategories = $(category).find(".subCategories");
                    var $categoryLink = $(category)
                        .find(".subCategoriesContainer .CategoriesName a")[0]
                        .getAttribute("href");

                    $(".category-list").append(
                        '<li><a href="#">' +
                            $categoryName +
                            '<i class="icon-down-arrow"></i></a><ul class="subcategory-list subcategory-list-' +
                            index +
                            '"></ul></li>'
                    );

                    $subcategories.each(function (ind, subcategory) {
                        $(".category-list")
                            .find(".subcategory-list-" + index)
                            .append(
                                '<li><a class="subcategory-link" href="' +
                                    $(subcategory).find("a").attr("href") +
                                    '">' +
                                    $(subcategory).text() +
                                    "</a></li>"
                            );
                    });

                    $(".subcategory-list-" + index).each(function (indexSubEl, subEl) {
                        $(subEl).append(
                            '<li><a class="subcategory-link subcategory-link-see-all" href="' +
                                $categoryLink +
                                '">Ver todo</a></li>'
                        );
                    });
                });

                $(".subcategory-link").on("click", function () {
                    openLink($(this).attr("href"));
                });

                function openLink(link) {
                    window.location = link;
                }

                $(document).on("click", ".blackOverlay ", function () {
                    $(".cart-sumary").removeClass("is-active active");
                    $(".blackOverlay").removeClass("is-active");
                    $(".js-btnCartSumary").removeClass("active");
                    $("body").css("overflow-y", "scroll");
                    $(".ProductVitrine-ContainerImagen").removeClass("is-active");

                    $(".icon-user-close1").addClass("icon-user1");
                    $(".wrapperIcons").find(".boxCont").hide();
                    //elementCart.removeClass("active");
                });

                $(".categoriesBtn")
                    .mouseenter(function () {
                        $(".categoriesContainer").addClass("is-active");
                        $(".categoryInnerContainer").addClass("is-active");
                        $(".categoriesBtn").addClass("is-active");
                        $(".blackOverlay").addClass("is-active");
                    })
                    .mouseleave(function () {
                        $(".categoriesContainer").removeClass("is-active");
                        $(".categoryInnerContainer").removeClass("is-active");
                        $(".categoriesBtn").removeClass("is-active");
                        $(".blackOverlay").removeClass("is-active");
                    });
                $(".categoryInnerContainer")
                    .mouseenter(function () {
                        $(".categoriesContainer").addClass("is-active");
                        $(".categoryInnerContainer").addClass("is-active");
                        $(".categoriesBtn").addClass("is-active");
                        $(".blackOverlay").addClass("is-active");
                    })
                    .mouseleave(function () {
                        $(".categoriesContainer").removeClass("is-active");
                        $(".categoryInnerContainer").removeClass("is-active");
                        $(".categoriesBtn").removeClass("is-active");
                        $(".blackOverlay").removeClass("is-active");
                    });
                $(".categoryHeader").click(function () {
                    // $(this).parents(".category").toggleClass("is-active");
                });
                $(".leftContainer>.boton").click(function () {
                    $(".menuContainer ").toggleClass("is-active");
                    $(this).toggleClass("is-active");
                });
                $(".searchIcon").click(function () {
                    $(".menuContainer").toggleClass("open-search");
                    $(this).toggleClass("open-search");
                });

                if (window.location.href.indexOf("links-de-interes") > -1) {
                    $("title").text("Links de Interes - Sugo");
                }
            });
        });
    };

    var funcionesFooter = function () {
        $(document).on("click", ".container-Bottom", function () {
            var containerForm = $(this).parents(".container-form");

            if (containerForm.hasClass("hidden")) {
                containerForm.addClass("active");
                containerForm.removeClass("hidden");
            } else {
                containerForm.removeClass("active");
                containerForm.addClass("hidden");
            }
        });

        $(".column").on("click", ".titleDataFooter", function () {
            $(this).parent().siblings().find(".titleDataFooter").removeClass("titleDataFooterActive");
            $(this).parent().siblings().find(".titleDataFooter").next().slideUp();

            var toggleState = $(this).next().is(":hidden");
            $(this).next().slideToggle();

            if (!toggleState) {
                $(this).removeClass("titleDataFooterActive");
            } else {
                $(this).addClass("titleDataFooterActive");
            }
        });
    };

    var showPrincipalPopUp = function () {
        $(document).on("PopUp:clientInfo", (e, res) => {
            if (!sessionStorage.getItem("showPrincipalPopUp")) {
                if (
                    res.estadoUsuario &&
                    res.estadoUsuario.indexOf("Primera compra") == -1 &&
                    res.estadoUsuario.indexOf("Usuario Recurrente") == -1 &&
                    res.referred
                ) {
                    $(".containerPopUp.referred").css("display", "block");
                } else if (
                    res.estadoUsuario &&
                    res.estadoUsuario.indexOf("Primera Compra") == -1 &&
                    res.estadoUsuario.indexOf("Usuario Recurrente") == -1 &&
                    res.referred == false && res.referrer == false
                ){
                    $(".containerPopUp.secundaryPopUp").css("display", "block");
                }else{
                    $(".containerPopUp:not(.referred)").css("display", "block");
                }
                $(".close-content-popUp, .containerPopUp").click(function (event) {
                    $(".containerPopUp").css("display", "none");
                });
                sessionStorage.setItem("showPrincipalPopUp", true);
            }
        });
    };

    return {
        init: init,
    };
})();

$(document).ready(function () {
    if ($("body#producto").length) {
        setTimeout(() => {
            generales.init();
        }, 800);
    } else {
        generales.init();
    }
});

module.exports = generales;
alert('prueba conexión')