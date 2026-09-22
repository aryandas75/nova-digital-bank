// Email service
// Email notifications are disabled.
// Banking operations do not depend on email.

async function sendEmail(to, subject, text, html) {
    console.log("Email service disabled.");
    return null;
}


// Registration email
async function sendRegister(userEmail, name) {
    console.log(
        `Registration email skipped for ${userEmail}`
    );

    return null;
}


// Successful transaction email
async function sendTransactionEmail(
    userEmail,
    name,
    amount,
    toAccount
) {
    console.log(
        `Transaction email skipped for ${userEmail}`
    );

    return null;
}


// Failed transaction email
async function sendTransactionfailureEmail(
    userEmail,
    name,
    amount,
    toAccount
) {
    console.log(
        `Transaction failure email skipped for ${userEmail}`
    );

    return null;
}


module.exports = {
    sendEmail,
    sendRegister,
    sendTransactionEmail,
    sendTransactionfailureEmail
};