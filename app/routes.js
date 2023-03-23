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

router.get(['/path-check'], (req, res) => {
  req.session.data.path = req.session.data['etii-or-hn']
  switch (req.session.data.path) {
    case 'heat-network':
      res.redirect('/is-your-heat-network-powered-by-electricity-or-gas')
      break
    case 'etii':
    default:
      res.redirect('/what-is-your-crn')
      break
  }
})

router.get(['/bingo-check'], (req, res) => {
  const bingo = req.session.data.crn === '12345678'
  if (bingo) {
    res.redirect('/is-this-your-org')
  } else {
    res.redirect('/complex-eligibility')
  }
})

router.get(['/org-check'], (req, res) => {
  const confirmOrg = req.session.data['is-this-your-org'] === 'yes'
  if (confirmOrg) {
    res.redirect('/simple-eligibility')
  } else {
    res.redirect('/complex-eligibility')
  }
})

router.get(['/applying-for-check'], (req, res) => {
  const confirmOrg = req.session.data['is-this-your-org'] === 'yes'
  if (confirmOrg) {
    res.redirect('/who-can-we-contact')
  } else {
    res.redirect('/business-org-type')
  }
})

router.get('/hn-power-check', (req, res) => {
  switch (req.session.data['gas-or-electricity']) {
    case 'gas':
    case 'electricity':
    case 'both':
    default:
      res.redirect('/heat-network-serve-domestic-customer')
      break
    case 'other':
      res.redirect('/not-eligible-for-discount')
  }
})

router.get(['/connection-check'], (req, res) => {
  switch (req.session.data['connected-to-gas-electricity']) {
    case 'no':
      res.redirect('/not-eligible-for-discount')
      break
    case 'yes':
    default:
      if (req.session.data.path === 'heat-network') {
        res.redirect('/heat-network-serve-domestic-customer')
      } else {
        res.redirect('/organisation-name')
      }
      break
  }
})

router.get(['/domestic-check'], (req, res) => {
  switch (req.session.data['hn-serve-domestic']) {
    case 'no':
      res.redirect('/must-serve-at-least-one-domestic-customer')
      break
    case 'yes':
    default:
      res.redirect('/who-can-we-contact')
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
    case 'some':
      res.redirect('/share-certificate-via-landlord')
      break
    case 'yes':
    default:
      res.redirect('/energy-check')
  }
})

router.get('/no-access-reason-check', (req, res) => {
  switch (req.session.data['no-access-reason']) {
    case 'cannot-find':
      res.redirect('/ineligible-no-access')
      break
    case 'intermediary':
    default:
      res.redirect('/some-or-none-check')
      break
  }
})

router.get(['/some-or-none-check'], (req, res) => {
  switch (req.session.data['access-to-meters']) {
    case 'no':
      res.redirect('/you-need-to-provide-evidence')
      break
    case 'some':
    default:
      res.redirect('/energy-check')
  }
})

router.get(['/energy-check'], (req, res) => {
  switch (req.session.data['gas-or-electricity']) {
    case 'gas':
    case 'both':
    default:
      res.redirect('/who-is-your-gas-supplier')
      break
    case 'electricity':
      res.redirect('/who-is-your-electricity-supplier')
      break
    case 'other':
      res.redirect('/not-eligible-for-discount')
  }
})

router.get(['/add-gas-supplier'], (req, res) => {
  const skip = req.session.data.action === 'skip'
  if (skip) {
    if (req.session.data['gas-or-electricity'] === 'both') {
      res.redirect('/who-is-your-electricity-supplier')
    }
    else if (req.session.data.gasSuppliers) {
      res.redirect('/supplier-summary')
    }
    else {
      res.redirect('/you-need-to-provide-evidence')
    }
  } else {
    const supplierName = req.session.data['gas-supplier']
    if (req.session.data.gasSuppliers === undefined) req.session.data.gasSuppliers = []
    req.session.data.gasSuppliers.find(entry => entry.supplier === supplierName) ?? req.session.data.gasSuppliers.push({ supplier: supplierName, meterNumbers: [], chp: [], supply: [], egc: [], besides: [] })
    res.redirect('/what-is-your-gas-meter-number')
  }
})

router.get(['/add-electricity-supplier'], (req, res) => {
  const skip = req.session.data.action === 'skip'
  if (skip) {
    if (req.session.data.electricitySuppliers) {
      res.redirect('/supplier-summary')
    }
    else {
      res.redirect('/you-need-to-provide-evidence')
    }
  } else {
    const supplierName = req.session.data['electricity-supplier']
    if (req.session.data.electricitySuppliers === undefined) req.session.data.electricitySuppliers = []
    req.session.data.electricitySuppliers.find(entry => entry.supplier === supplierName) ?? req.session.data.electricitySuppliers.push({ supplier: supplierName, meterNumbers: [], chp: [], supply: [], egc: [], besides: [] })
    res.redirect('/what-is-your-electricity-meter-number')
  }
})

router.get(['/add-gas-meter'], (req, res) => {
  const supplierName = req.session.data['gas-supplier']
  const supplier = req.session.data.gasSuppliers.find(entry => entry.supplier === supplierName)
  supplier.meterNumbers.push(req.session.data['meter-number'])
  if (req.session.data.path === 'heat-network') {
    res.redirect('/is-this-a-chp')
  } else {
    res.redirect('/gas-supplier-summary')
  }
})

router.get(['/add-electricity-meter'], (req, res) => {
  const supplierName = req.session.data['electricity-supplier']
  const supplier = req.session.data.electricitySuppliers.find(entry => entry.supplier === supplierName)
  supplier.meterNumbers.push(req.session.data['meter-number'])
  if (req.session.data.path === 'heat-network') {
    res.redirect('/is-this-a-chp')
  } else {
    res.redirect('/electricity-supplier-summary')
  }
})

router.get(['/chp-check'], (req, res) => {
  let latestMeter
  if (req.session.data['gas-added']) {
    latestMeter = req.session.data.electricitySuppliers[req.session.data.electricitySuppliers.length - 1]
    latestMeter.chp.push(req.session.data.chp)
    res.redirect('/electricity-supplier-summary')
  } else {
    latestMeter = req.session.data.gasSuppliers[req.session.data.gasSuppliers.length - 1]
    latestMeter.chp.push(req.session.data.chp)
    res.redirect('/gas-supplier-summary')
  }
})

router.get(['/chp-supply-check'], (req, res) => {
  let latestMeter
  if (req.session.data['gas-added']) {
    latestMeter = req.session.data.electricitySuppliers[req.session.data.electricitySuppliers.length - 1]
  } else {
    latestMeter = req.session.data.gasSuppliers[req.session.data.gasSuppliers.length - 1]
  }
  latestMeter.supply.push(req.session.data['chp-supply'])
  switch (req.session.data['chp-supply']) {
    case 'no':
      res.redirect('/anything-besides-heat-generation')
      break
    case 'yes':
    default:
      res.redirect('/installed-electrical-generation-capacity')
      break
  }
})

router.get(['/egc-check'], (req, res) => {
  let latestMeter
  if (req.session.data['gas-added']) {
    latestMeter = req.session.data.electricitySuppliers[req.session.data.electricitySuppliers.length - 1]
  } else {
    latestMeter = req.session.data.gasSuppliers[req.session.data.gasSuppliers.length - 1]
  }
  latestMeter.egc.push(req.session.data['egc-chp'])
  res.redirect('/anything-besides-heat-generation')
})

router.get(['/besides-check'], (req, res) => {
  let latestMeter
  if (req.session.data['gas-added']) {
    latestMeter = req.session.data.electricitySuppliers[req.session.data.electricitySuppliers.length - 1]
  } else {
    latestMeter = req.session.data.gasSuppliers[req.session.data.gasSuppliers.length - 1]
  }
  latestMeter.besides.push(req.session.data['besides'])
  if (req.session.data['gas-added']) {
    res.redirect('/electricity-supplier-summary')
  } else {
    res.redirect('/gas-supplier-summary')
  }
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
        req.session.data['gas-added'] = true
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
    if (req.session.data.path === 'heat-network') {
      res.redirect('/check-your-answers')
    } else {
      res.redirect('/add-website-url')
    }
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

router.get(['/ni-check'], (req, res) => {
  const declared = req.session.data['ni-protocol'] === 'yes'
  res.redirect('/check-your-answers')
})
