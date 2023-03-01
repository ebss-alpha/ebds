//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

router.get(['/start'], (req, res) => {
  req.session.data = {
    cookies: req.session.data.cookies
  }
  res.render('start.html')
})

router.get(['/cookie-choice'], (req, res) => {
  const cookieChoice = req.query.choice === 'accept'
  req.session.data.cookies = cookieChoice
  res.redirect(req.headers.referer)
})

router.get(['/connection-check'], (req, res) => {
  switch (req.session.data['connected-to-gas-electricity']) {
    case 'no':
      res.redirect('/not-eligible-for-discount')
      break
    case 'yes':
    default:
      res.redirect('/organisation-name')
      break
  }
})

router.get(['/address-lookup'], (req, res) => {
  const hasNumber = req.session.data['address-housenumber']
  if (hasNumber) {
    res.redirect('/is-this-your-address')
  } else {
    res.redirect('/choose-your-address')
  }
})

router.get(['/address-confirmation-check'], (req, res) => {
  switch (req.session.data['is-this-your-address']) {
    case 'no':
      res.redirect('/enter-your-address-manually')
      break
    case 'yes':
    default:
      res.redirect('/what-is-your-relationship-to-the-organisation')
      break
  }
})

router.get(['/access-check'], (req, res) => {
  switch (req.session.data['access-to-meters']) {
    case 'no':
      res.redirect('/share-certificate-via-landlord')
      break
    case 'yes':
    default:
      res.redirect('/are-you-registering-for-gas-or-electricity')
  }
})

router.get(['/energy-check'], (req, res) => {
  req.session.data.gasSuppliers = []
  req.session.data.electricitySuppliers = []
  switch (req.session.data['gas-or-electricity']) {
    case 'gas':
    case 'both':
      res.redirect('/who-is-your-gas-supplier')
      break
    case 'electricity':
      res.redirect('/who-is-your-electricity-supplier')
      break
  }
})

router.get(['/add-gas-supplier'], (req, res) => {
  const supplierName = req.session.data['gas-supplier']
  if (!req.session.data.gasSuppliers) {
    req.session.data.gasSuppliers = []
  }
  if (!req.session.data.gasSuppliers.find(entry => entry.supplier === supplierName)) {
    req.session.data.gasSuppliers.push({ supplier: supplierName, meterNumbers: [] })
  }
  res.redirect('/what-is-your-gas-meter-number')
})

router.get(['/add-electricity-supplier'], (req, res) => {
  const supplierName = req.session.data['electricity-supplier']
  if (!req.session.data.electricitySuppliers) {
    req.session.data.electricitySuppliers = []
  }
  if (!req.session.data.electricitySuppliers.find(entry => entry.supplier === supplierName)) {
    req.session.data.electricitySuppliers.push({ supplier: supplierName, meterNumbers: [] })
  }
  res.redirect('/what-is-your-electricity-meter-number')
})

router.get(['/add-gas-meter'], (req, res) => {
  const supplierName = req.session.data['gas-supplier']
  const supplier = req.session.data.gasSuppliers.find(entry => entry.supplier === supplierName)
  supplier.meterNumbers.push(req.session.data['meter-number'])
  res.redirect('/gas-supplier-summary')
})

router.get(['/add-electricity-meter'], (req, res) => {
  const supplierName = req.session.data['electricity-supplier']
  const supplier = req.session.data.electricitySuppliers.find(entry => entry.supplier === supplierName)
  supplier.meterNumbers.push(req.session.data['meter-number'])
  res.redirect('/electricity-supplier-summary')
})

router.get(['/supplier-check'], (req, res) => {
  switch (req.session.data.action) {
    case 'add-gas-supplier':
      res.redirect('/who-is-your-gas-supplier')
      break
    case 'add-gas-meter':
      res.redirect('/what-is-your-gas-meter-number')
      break
    case 'continue-gas':
      if (req.session.data['gas-or-electricity'] === 'both') {
        res.redirect('/who-is-your-electricity-supplier')
      } else {
        res.redirect('/supplier-summary')
      }
      break
    case 'add-electricity-supplier':
      res.redirect('/who-is-your-electricity-supplier')
      break
    case 'add-electricity-meter':
      res.redirect('/what-is-your-electricity-meter-number')
      break
    case 'continue-electricity':
      res.redirect('/supplier-summary')
      break
    }
})

router.get(['/upload-check'], (req, res) => {
  req.session.data.removed = undefined
  if (req.query.continue) {
    res.redirect('/check-your-answers')
  } else {
    if (req.query['upload-multiple'] !== undefined && req.query['evidence'].length !== 0) {
      req.session.data.error = false
      if (req.session.data['evidences'] === undefined) req.session.data['evidences'] = []
      req.session.data['evidences'] = req.session.data['evidences'].concat(req.session.data['evidence'])
      res.redirect('/you-need-to-provide-evidence')
    } else {
      req.session.data.error = true
      res.redirect('/you-need-to-provide-evidence')
    }
  }
})

router.get(['/remove-file'], (req, res) => {
  const indexToRemove = req.session.data['evidences'].indexOf(req.query.filename)
  req.session.data['evidences'].splice(indexToRemove, 1)
  req.session.data.removed = req.query.filename
  res.redirect('/you-need-to-provide-evidence')
})
