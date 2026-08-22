import { useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  EMPTY_CUSTOMER_FORM,
  type CustomerFormState,
  type Customer,
  type SelectedEquipment,
} from './types'
import { customers, equipment, equipmentCategories, findRate, jobTypes, levelsForJobType } from './lib/normalize'
import { defaultHoursFor, generateEstimateId, laborCost, laborRange, partsCost } from './lib/estimate'
import { phoneDigits } from './lib/format'
import { parseAddress } from './lib/address'
import { JOB_TYPE_LABELS } from './lib/labels'
import { STEPS } from './lib/steps'
import QuestionLayout from './components/QuestionLayout'
import ChoiceQuestion from './components/questions/ChoiceQuestion'
import LookupQuestion, { type LookupMode } from './components/questions/LookupQuestion'
import NameAddressQuestion from './components/questions/NameAddressQuestion'
import EquipmentQuestion from './components/questions/EquipmentQuestion'
import ContactPropertyQuestion from './components/questions/ContactPropertyQuestion'
import SystemDetailsQuestion from './components/questions/SystemDetailsQuestion'
import LevelHoursQuestion from './components/questions/LevelHoursQuestion'
import ReviewStep from './components/ReviewStep'
import { clearDraft, loadDraft, saveDraft } from './lib/draft'
import { estimateTax } from './lib/pricing'
import { recommendEquipment } from './lib/recommendations'
import {
  loadSavedCustomers,
  mergeCustomers,
  persistSavedCustomers,
  upsertSavedCustomer,
} from './lib/customerStore'
import {
  loadSavedEstimates,
  persistSavedEstimates,
  upsertSavedEstimate,
  type SavedEstimate,
} from './lib/estimateStore'

function customerToForm(customer: Customer): CustomerFormState {
  const address = parseAddress(customer.address)
  return {
    name: customer.name,
    addressLine: address.line1,
    city: address.city,
    state: address.state,
    zip: address.zip,
    phone: phoneDigits(customer.phone ?? ''),
    propertyType: customer.propertyType,
    squareFootage: customer.squareFootage ? String(customer.squareFootage) : '',
    systemType: customer.systemType ?? '',
    systemAge: customer.systemAge !== undefined ? String(customer.systemAge) : '',
  }
}

function ContinueButton({
  label = 'Continue',
  disabled = false,
  onClick,
}: {
  label?: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button type="button" className="primary-button primary-button--block" disabled={disabled} onClick={onClick}>
      {label}
    </button>
  )
}

function App() {
  const [initialDraft] = useState(() => loadDraft(generateEstimateId()))
  const [stepIndex, setStepIndex] = useState(initialDraft.stepIndex)
  const [lookupMode, setLookupMode] = useState<LookupMode>(initialDraft.lookupMode)

  const [customerForm, setCustomerForm] = useState<CustomerFormState>(initialDraft.customerForm)

  const [jobType, setJobType] = useState(initialDraft.jobType)
  const [level, setLevel] = useState(initialDraft.level)
  const [hours, setHours] = useState(initialDraft.hours)

  const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment[]>(initialDraft.selectedEquipment)
  const [notes, setNotes] = useState(initialDraft.notes)
  const [savedCustomers, setSavedCustomers] = useState(loadSavedCustomers)
  const [savedEstimates, setSavedEstimates] = useState(loadSavedEstimates)

  const [estimateId, setEstimateId] = useState(initialDraft.estimateId)
  const estimateDate = useMemo(
    () => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    [],
  )

  const rate = useMemo(() => findRate(jobType, level), [jobType, level])
  const laborTotal = useMemo(() => laborCost(rate, hours), [rate, hours])
  const partsSubtotal = useMemo(() => partsCost(selectedEquipment, equipment), [selectedEquipment])
  const subtotal = laborTotal + partsSubtotal
  const taxEstimate = useMemo(
    () => estimateTax(subtotal, customerForm),
    [subtotal, customerForm],
  )
  const total = subtotal + taxEstimate.tax
  const range = useMemo(() => laborRange(rate), [rate])
  const rangeMinSubtotal = range.min + partsSubtotal
  const rangeMaxSubtotal = range.max + partsSubtotal
  const rangeMin = rangeMinSubtotal * (1 + taxEstimate.ratePercent / 100)
  const rangeMax = rangeMaxSubtotal * (1 + taxEstimate.ratePercent / 100)
  const recommendations = useMemo(
    () => recommendEquipment(customerForm, jobType, level, equipment),
    [customerForm, jobType, level],
  )
  const allCustomers = useMemo(
    () => mergeCustomers(customers, savedCustomers),
    [savedCustomers],
  )

  useEffect(() => {
    saveDraft({
      stepIndex,
      lookupMode,
      customerForm,
      jobType,
      level,
      hours,
      selectedEquipment,
      notes,
      estimateId,
    })
  }, [
    stepIndex,
    lookupMode,
    customerForm,
    jobType,
    level,
    hours,
    selectedEquipment,
    notes,
    estimateId,
  ])

  const selectedItems = useMemo(
    () =>
      selectedEquipment
        .map((line) => ({ line, item: equipment.find((eq) => eq.id === line.equipmentId) }))
        .filter(
          (entry): entry is { line: SelectedEquipment; item: (typeof equipment)[number] } =>
            Boolean(entry.item),
        ),
    [selectedEquipment],
  )

  function goNext() {
    const nextStep = STEPS[Math.min(stepIndex + 1, STEPS.length - 1)]
    if (nextStep === 'review' && nameAddressValid) {
      setSavedCustomers((previous) => {
        const next = upsertSavedCustomer(customerForm, previous, allCustomers)
        if (next !== previous) persistSavedCustomers(next)
        return next
      })
      setSavedEstimates((previous) => {
        const next = upsertSavedEstimate(previous, {
          estimateId,
          savedAt: new Date().toISOString(),
          customerForm,
          jobType,
          level,
          hours,
          selectedEquipment,
          notes,
          total,
        })
        persistSavedEstimates(next)
        return next
      })
    }
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1))
  }

  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0))
  }

  function handleSelectCustomer(customer: Customer) {
    setCustomerForm(customerToForm(customer))
  }

  function handleStartBlank() {
    setCustomerForm(EMPTY_CUSTOMER_FORM)
  }

  function handleChangeForm(patch: Partial<CustomerFormState>) {
    setCustomerForm((prev) => ({ ...prev, ...patch }))
  }

  function handleSelectLevel(nextLevel: string) {
    setLevel(nextLevel)
    const nextRate = findRate(jobType, nextLevel)
    setHours(nextRate ? defaultHoursFor(nextRate) : 0)
  }

  function handleAddEquipment(equipmentId: string) {
    setSelectedEquipment((prev) =>
      prev.some((line) => line.equipmentId === equipmentId)
        ? prev
        : [...prev, { equipmentId, quantity: 1 }],
    )
  }

  function handleRemoveEquipment(equipmentId: string) {
    setSelectedEquipment((prev) => prev.filter((line) => line.equipmentId !== equipmentId))
  }

  function handleSetQuantity(equipmentId: string, quantity: number) {
    setSelectedEquipment((prev) =>
      prev.map((line) => (line.equipmentId === equipmentId ? { ...line, quantity } : line)),
    )
  }

  function handleStartOver() {
    clearDraft()
    setStepIndex(0)
    setLookupMode('ask')
    setCustomerForm(EMPTY_CUSTOMER_FORM)
    setJobType('')
    setLevel('')
    setHours(0)
    setSelectedEquipment([])
    setNotes('')
    setSavedCustomers(loadSavedCustomers())
    setSavedEstimates(loadSavedEstimates())
    setEstimateId(generateEstimateId())
  }

  function handleResumeEstimate(estimate: SavedEstimate) {
    setCustomerForm(estimate.customerForm)
    setJobType(estimate.jobType)
    setLevel(estimate.level)
    setHours(estimate.hours)
    setSelectedEquipment(estimate.selectedEquipment)
    setNotes(estimate.notes)
    setEstimateId(estimate.estimateId)
    setLookupMode('ask')
    setStepIndex(STEPS.indexOf('review'))
  }

  const stepKey = STEPS[stepIndex]
  const stepNumber = stepIndex + 1
  const totalSteps = STEPS.length
  const onBack =
    stepKey === 'lookup' && lookupMode === 'search'
      ? () => setLookupMode('ask')
      : stepIndex > 0
        ? goBack
        : undefined

  const nameAddressValid =
    customerForm.name.trim() !== '' &&
    customerForm.addressLine.trim() !== '' &&
    customerForm.city.trim() !== '' &&
    customerForm.state.trim() !== '' &&
    customerForm.zip.trim() !== ''

  useEffect(() => {
    if (stepKey !== 'review' || !nameAddressValid) return
    const next = upsertSavedCustomer(customerForm, savedCustomers, allCustomers)
    if (next !== savedCustomers) persistSavedCustomers(next)
  }, [stepKey, nameAddressValid, customerForm, savedCustomers, allCustomers])

  useEffect(() => {
    if (stepKey !== 'review' || !nameAddressValid) return
    const next = upsertSavedEstimate(savedEstimates, {
      estimateId,
      savedAt: new Date().toISOString(),
      customerForm,
      jobType,
      level,
      hours,
      selectedEquipment,
      notes,
      total,
    })
    persistSavedEstimates(next)
  }, [
    stepKey,
    nameAddressValid,
    savedEstimates,
    estimateId,
    customerForm,
    jobType,
    level,
    hours,
    selectedEquipment,
    notes,
    total,
  ])

  return (
    <div className="app-shell">
      <header className="app-header no-print">
        <div className="app-header__brand">
          <img className="app-header__mark" src="/logo-mark.png" alt="" width={36} height={36} />
          <div>
            <strong>Right Click</strong>
            <span>Instant HVAC estimates</span>
          </div>
        </div>
      </header>

      {stepKey === 'lookup' && (
        <QuestionLayout
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          onBack={onBack}
          eyebrow="Let's build an estimate"
          title="Is this for an existing customer?"
          subtitle="Look them up to auto-fill their property, or start fresh for a new lead."
        >
          <LookupQuestion
            customers={allCustomers}
            mode={lookupMode}
            onModeChange={setLookupMode}
            onSelectCustomer={handleSelectCustomer}
            onStartBlank={handleStartBlank}
            onContinue={goNext}
            recentEstimates={savedEstimates}
            onResumeEstimate={handleResumeEstimate}
          />
        </QuestionLayout>
      )}

      {stepKey === 'nameAddress' && (
        <QuestionLayout
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          onBack={onBack}
          title="Who's this estimate for?"
          footer={<ContinueButton disabled={!nameAddressValid} onClick={goNext} />}
        >
          <NameAddressQuestion
            name={customerForm.name}
            addressLine={customerForm.addressLine}
            city={customerForm.city}
            state={customerForm.state}
            zip={customerForm.zip}
            knownCustomers={allCustomers}
            onChangeName={(v) => handleChangeForm({ name: v })}
            onChangeAddressLine={(v) => handleChangeForm({ addressLine: v })}
            onChangeCity={(v) => handleChangeForm({ city: v })}
            onChangeState={(v) => handleChangeForm({ state: v })}
            onChangeZip={(v) => handleChangeForm({ zip: v })}
            onSubmit={goNext}
            canSubmit={nameAddressValid}
          />
        </QuestionLayout>
      )}

      {stepKey === 'contactProperty' && (
        <QuestionLayout
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          onBack={onBack}
          title="Contact & property"
          subtitle="Phone is optional."
          footer={<ContinueButton onClick={goNext} />}
        >
          <ContactPropertyQuestion
            phone={customerForm.phone}
            onChangePhone={(v) => handleChangeForm({ phone: v })}
            propertyType={customerForm.propertyType}
            onChangePropertyType={(v) => handleChangeForm({ propertyType: v })}
          />
        </QuestionLayout>
      )}

      {stepKey === 'systemDetails' && (
        <QuestionLayout
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          onBack={onBack}
          title="Tell us about the property and system"
          subtitle="Add what you know; all three fields are optional."
          footer={<ContinueButton onClick={goNext} />}
        >
          <SystemDetailsQuestion
            squareFootage={customerForm.squareFootage}
            systemType={customerForm.systemType}
            systemAge={customerForm.systemAge}
            onChangeSquareFootage={(v) => handleChangeForm({ squareFootage: v })}
            onChangeSystemType={(v) => handleChangeForm({ systemType: v })}
            onChangeSystemAge={(v) => handleChangeForm({ systemAge: v })}
            onSubmit={goNext}
          />
        </QuestionLayout>
      )}

      {stepKey === 'jobType' && (
        <QuestionLayout
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          onBack={onBack}
          title="What type of job is this?"
          footer={<ContinueButton disabled={!jobType} onClick={goNext} />}
        >
          <ChoiceQuestion
            value={jobType}
            onSelect={(v) => {
              setJobType(v)
              setLevel('')
              setHours(0)
            }}
            options={jobTypes.map((jt) => ({ value: jt, label: JOB_TYPE_LABELS[jt] ?? jt }))}
          />
        </QuestionLayout>
      )}

      {stepKey === 'levelHours' && (
        <QuestionLayout
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          onBack={onBack}
          title="Level of work & hours"
          subtitle="We've set a typical starting point for hours — drag to adjust."
          footer={<ContinueButton disabled={!level} onClick={goNext} />}
        >
          <LevelHoursQuestion
            level={level}
            levels={levelsForJobType(jobType)}
            rate={rate}
            hours={hours}
            onSelectLevel={handleSelectLevel}
            onChangeHours={setHours}
          />
        </QuestionLayout>
      )}

      {stepKey === 'equipment' && (
        <QuestionLayout
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          onBack={onBack}
          title="Does this job need equipment or parts?"
          subtitle="Search or filter the catalog. Skip for labor-only work."
          footer={<ContinueButton onClick={goNext} />}
        >
          <EquipmentQuestion
            catalog={equipment}
            categories={equipmentCategories}
            selected={selectedEquipment}
            onAdd={handleAddEquipment}
            onRemove={handleRemoveEquipment}
            onSetQuantity={handleSetQuantity}
            recommendations={recommendations}
          />
        </QuestionLayout>
      )}

      {stepKey === 'review' && (
        <ReviewStep
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          onBack={goBack}
          estimateId={estimateId}
          estimateDate={estimateDate}
          customer={customerForm}
          jobType={jobType}
          level={level}
          rate={rate}
          hours={hours}
          laborTotal={laborTotal}
          selectedItems={selectedItems}
          partsSubtotal={partsSubtotal}
          total={total}
          taxEstimate={taxEstimate}
          customerSaved={nameAddressValid}
          rangeMin={rangeMin}
          rangeMax={rangeMax}
          notes={notes}
          onNotesChange={setNotes}
          onPrint={() => window.print()}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  )
}

export default App
