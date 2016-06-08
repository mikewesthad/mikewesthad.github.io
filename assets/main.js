var hasSeenToast = (Cookies.get("hasSeenToast") === "yes");

if (!hasSeenToast) {
    toastr.options = {
      "closeButton": true,
      "debug": false,
      "newestOnTop": false,
      "progressBar": false,
      "positionClass": "toast-top-center",
      "preventDuplicates": true,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "15000",
      "extendedTimeOut": "3000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    };
    toastr.info("Hey! This site is quite old. It's in the process of getting a much needed modern face-lift. The new site will be live by 6/13.");
}

Cookies.set("hasSeenToast", "yes", { expires: 3 });
