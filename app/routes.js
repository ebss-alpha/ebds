//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

router.get(['/start'], (req, res) => {
  req.session.data = {
    providers: providers,
    cookies: req.session.data.cookies
  }
  res.render('start.html')
})

router.get(['/cookie-choice'], (req, res) => {
  const cookieChoice = req.query.choice === 'accept'
  req.session.data.cookies = cookieChoice
  res.redirect(req.headers.referer)
})

router.get(['/add-gas-supplier'], (req, res) => {
  if (req.session.data.gasSuppliers === undefined) req.session.data.gasSuppliers = []
  req.session.data.gasSuppliers.push({
    provider: req.session.data['gas-supplier'],
    meterNumbers: []
  })
  res.redirect('/gas-provider-summary')
})
