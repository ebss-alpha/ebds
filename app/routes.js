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
    res.redirect('/what-is-your-sic-code')
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
        res.redirect('/what-is-the-name-of-the-organisation')
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
  const hasNumber = req.session.data['address-house-number']
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

router.get(['/direct-relationship-check'], (req, res) => {
  switch (req.session.data['direct-relationship']) {
    case 'no':
      res.redirect('/why-do-you-not-have-access')
      break
    case 'yes':
    default:
      res.redirect('/how-do-you-want-to-enter-your-details')
      break
  }
})

router.get(['/access-check'], (req, res) => {
  switch (req.session.data['access-to-meters']) {
    case 'no':
    case 'some':
      res.redirect('/you-need-to-provide-evidence')
      break
    case 'yes':
    default:
      res.redirect('/how-do-you-want-to-enter-your-details')
  }
})

router.get(['/bulk-upload-check'], (req, res) => {
  switch (req.session.data['manual-or-upload']) {
    case 'upload':
      res.redirect('/upload-your-meter-number')
      break
    case 'manual':
    default:
      res.redirect('/energy-check')
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
      res.redirect('/how-do-you-want-to-enter-your-details')
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
    const supplierData = req.session.data.suppliers.find(supplier => supplier.supplierName === supplierName) ?? {}
    if (supplierData.licenceExempt) {
      req.session.data['require-meters'] = '0'
      res.redirect('/do-you-have-meter-numbers-for-known-gas-nsc')
    } else {
      res.redirect('/what-is-the-company-name-as-it-appears-on-your-gas-bill')
    }
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
    const supplierData = req.session.data.suppliers.find(supplier => supplier.supplierName === supplierName) ?? {}
    if (supplierData.licenceExempt) {
      req.session.data['require-meters'] = '0'
      res.redirect('/do-you-have-meter-numbers-for-known-electricity-nsc')
    } else {
      res.redirect('/what-is-the-company-name-as-it-appears-on-your-electricity-bill')
    }
  }
})

router.get(['/add-gas-bill-name'], (req, res) => {
  const supplierName = req.session.data['gas-supplier']
  const supplier = req.session.data.gasSuppliers.find(entry => entry.supplier === supplierName)
  const addressLine1 = req.session.data['supplier-address-line-1']
  const addressLine2 = req.session.data['supplier-address-line-2']
  const addressTown = req.session.data['supplier-address-town']
  const addressCounty = req.session.data['supplier-address-county']
  const addressPostcode = req.session.data['supplier-address-postcode']
  const supplierAddress = `${addressLine1 ? addressLine1 + '<br>' : ''}${addressLine2 ? addressLine2 + '<br>' : ''}${addressTown ? addressTown + '<br>' : ''}${addressCounty ? addressCounty + '<br>' : ''}${addressPostcode ? addressPostcode + '<br>' : ''}`
  supplier.companyName = req.session.data['company-name']
  supplier.address = supplierAddress
  supplier.phoneNumber = req.session.data['supplier-telephone-number']
  supplier.emailAddress = req.session.data['supplier-email']
  const requireMeters = req.session.data['require-meters'] === '1'
  const hasMeterNumbers = req.session.data['new-gas-supplier-meters'] === 'yes'
  if (requireMeters || hasMeterNumbers) {
    res.redirect('/what-is-your-gas-meter-number')
  } else {
    res.redirect('/gas-supplier-summary')
  }
})

router.get(['/add-electricity-bill-name'], (req, res) => {
  const supplierName = req.session.data['electricity-supplier']
  const supplier = req.session.data.electricitySuppliers.find(entry => entry.supplier === supplierName)
  const addressLine1 = req.session.data['supplier-address-line-1']
  const addressLine2 = req.session.data['supplier-address-line-2']
  const addressTown = req.session.data['supplier-address-town']
  const addressCounty = req.session.data['supplier-address-county']
  const addressPostcode = req.session.data['supplier-address-postcode']
  const supplierAddress = `${addressLine1 ? addressLine1 + '<br>' : ''}${addressLine2 ? addressLine2 + '<br>' : ''}${addressTown ? addressTown + '<br>' : ''}${addressCounty ? addressCounty + '<br>' : ''}${addressPostcode ? addressPostcode + '<br>' : ''}`
  supplier.companyName = req.session.data['company-name']
  supplier.address = supplierAddress
  supplier.phoneNumber = req.session.data['supplier-telephone-number']
  supplier.emailAddress = req.session.data['supplier-email']
  const requireMeters = req.session.data['require-meters'] === '1'
  const hasMeterNumbers = req.session.data['new-electricity-supplier-meters'] === 'yes'
  if (requireMeters || hasMeterNumbers) {
    res.redirect('/what-is-your-electricity-meter-number')
  } else {
    res.redirect('/electricity-supplier-summary')
  }
})

router.get(['/add-gas-meter'], (req, res) => {
  const supplierName = req.session.data['gas-supplier']
  const supplier = req.session.data.gasSuppliers.find(entry => entry.supplier === supplierName)
  supplier.meterNumbers.push(req.session.data['meter-number'])
  if (req.session.data.path === 'heat-network') {
    res.redirect('/anything-besides-heat-generation')
  } else {
    res.redirect('/gas-supplier-summary')
  }
})

router.get(['/add-electricity-meter'], (req, res) => {
  const supplierName = req.session.data['electricity-supplier']
  const supplier = req.session.data.electricitySuppliers.find(entry => entry.supplier === supplierName)
  supplier.meterNumbers.push(req.session.data['meter-number'])
  if (req.session.data.path === 'heat-network') {
    res.redirect('/anything-besides-heat-generation')
  } else {
    res.redirect('/electricity-supplier-summary')
  }
})

router.get('/what-is-your-sic-code', (req, res) => {
  res.render('what-is-your-sic-code.html', { req: req })
})

router.get(['/add-sic-code'], (req, res) => {
  const sicCode = req.session.data['sic-code']
  if (req.session.data.sicCodes === undefined) req.session.data.sicCodes = []
  const regex = /^(\d+\.\d+)\s(.*)$/;
  const result = sicCode.match(regex);
  const codeAndDescription = { SIC: result[1], description: result[2] };
  if (req.session.data['update-sic'] >= 0) {
    req.session.data.sicCodes[req.session.data['update-sic']] = codeAndDescription
  } else {
    req.session.data.sicCodes.push(codeAndDescription)
  }
  if (req.session.data.sicCodes.length === 4) {
    res.redirect('/review-your-eligible-sic-codes')
  } else {
    res.redirect('/do-you-have-another-sic-code')
  }
})

router.get(['/another-sic-code-check'], (req, res) => {
  const another = req.session.data['another-sic-code'] === 'yes'
  if (another) {
    res.redirect('/what-is-your-sic-code')
  } else {
    res.redirect('/review-your-eligible-sic-codes')
  }
})

router.get(['/remove-sic'], (req, res) => {
  const toRemove = req.query.sic
  req.session.data.sicCodes = req.session.data.sicCodes.filter(sic => sic.SIC !== toRemove)
  if (req.session.data.sicCodes.length !== 0) {
    res.redirect('/review-your-eligible-sic-codes')
  } else {
    res.redirect('/what-is-your-sic-code')
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
  switch (req.session.data['currently-entering']) {
    case 'electricity':
      latestMeter = req.session.data.electricitySuppliers[req.session.data.electricitySuppliers.length - 1]
      latestMeter.besides.push(req.session.data['besides'])
      res.redirect('/electricity-supplier-summary')
      break
    case 'gas':
    default:
      latestMeter = req.session.data.gasSuppliers[req.session.data.gasSuppliers.length - 1]
      latestMeter.besides.push(req.session.data['besides'])
      res.redirect('/gas-supplier-summary')
      break
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
      res.redirect('/ni-protocol')
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
