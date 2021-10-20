$(document).ready(function () {

  $("#searchField").on("keyup", function(e) {
    refreshUsersTable();
  });

  $("#openUserModalBtn").click(function() {
    $("#addUserModal").modal("show");
  });

  $("#addUserModal").on("hidden.bs.modal", function(){
    $(this).find("form")[0].reset();
    clearValidationErrors();
 });

  $("#addUserBtn").click(function() {
    addUser();
  });

  if (typeof(Storage) !== "undefined") {
    userList = JSON.parse(localStorage.getItem("userList") ?? "[]");
    refreshUsersTable();
  }
});

let userList = [];
const emailRegEx = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
const phoneRegEx = /^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/;

refreshUsersTable = function() {
  if (typeof(Storage) !== "undefined") {
    localStorage.setItem("userList", JSON.stringify(userList));
  }
  
  const filter = $.trim($("#searchField").val()).toLowerCase();
  const filteredList = !!filter.length ?
    userList.filter((user) => {
      return user.firstName.toLowerCase().indexOf(filter) > -1 ||
            user.lastName.toLowerCase().indexOf(filter) > -1 ||
            user.email.toLowerCase().indexOf(filter) > -1 ||
            user.phone.toLowerCase().indexOf(filter) > -1
    })
    : userList;

  $("#usersTable").find(".data-row").remove();
  if (filteredList.length > 0) {
    $("#emptyDataRow").hide();

    filteredList.forEach((user) => {
      var lastRow = $("<tr class='data-row'/>").appendTo($("#usersTable").find("tbody:last"));
      $.each(user, (property, value) => {
        if (property === "isActive") {
          lastRow.append($("<td>" +
                            "<label class='switch'>" +
                              "<input class='activity-switch' type='checkbox' " + (value == 1 ? "checked" : "") + " user-id=" + user.id + ">" +
                              "<span class='slider round'></span>" +
                            "</label>" +
                          "</td>"));

          $(".activity-switch").unbind();
          $(".activity-switch").on("click", function (e) {
            e.preventDefault();
            showConfirmationDialog($(e.target).attr("user-id"));
          });
        }
        else
          lastRow.append($("<td />").text(value));
      });
    });
  }
  else
    $("#emptyDataRow").show();
};

clearValidationErrors = function() {
  $(".form-group").removeClass("has-error");
  $(".error-block").remove();
};

validateRequiredField = function(fieldId) {
  const field = $(fieldId);
  if (!field.val() || !field.val().length) {
    field.closest(".form-group").addClass("has-error");
    field.after("<div class='error-block'>Value is mandatory</div>");
    return false;
  }
  return true;
};

validateRegularExpressionField = function(fieldId, regEx, valueName) {
  const field = $(fieldId);
  if (!regEx.test(field.val())) {
    field.closest(".form-group").addClass("has-error");
    field.after("<div class='error-block'>Value is not valid " + valueName + "</div>");
    return false;
  }
  return true;
};

addUser = function() {
  clearValidationErrors();
  let isValid = true;

  isValid = validateRequiredField("#firstName");
  isValid = validateRequiredField("#lastName") && isValid;
  isValid = validateRequiredField("#email") && validateRegularExpressionField("#email", emailRegEx, "email address") && isValid;
  isValid = validateRequiredField("#phone") && validateRegularExpressionField("#phone", phoneRegEx, "phone number") && isValid;
  isValid = validateRequiredField("#isActive") && isValid;
  
  if (isValid) {
    const user = {
      id: Math.max(...userList.map(function(o) { return o.id; })) + 1,
      firstName: $("#firstName").val(),
      lastName: $("#lastName").val(),
      email: $("#email").val(),
      phone: $("#phone").val(),
      isActive: $("#isActive").val()
    };
    userList.push(user);

    refreshUsersTable();
    $("#addUserModal").modal("hide");
  }
};

showConfirmationDialog = function(userid) {
  const indx = userList.findIndex(item => item.id == userid);
  const user = userList[indx];

  $("#confirmationModalText").html("Are you sure you want to change status of <b>" + user.firstName + " " + user.lastName + "</b> " +
                                   "from <b>" + (user.isActive == 1 ? "Active" : "Inactive") + "</b> to <b>" + (user.isActive == 1 ? "Inactive" : "Active") + "</b>?");
  
  $("#confirmationModalConfirmButton").unbind();
  $("#confirmationModalConfirmButton").on("click", function (e) {
    e.preventDefault();
    userList[indx].isActive = user.isActive == 1 ? 0 : 1;
    refreshUsersTable();
    $("#confirmationModal").modal("hide");
  });
  $("#confirmationModal").modal("show");
};