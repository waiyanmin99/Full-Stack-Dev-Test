import { useMemo, useState } from 'react'
import './App.css'
import { EMPTY_CUSTOMER_FORM, type CustomerFormState, type Customer, type SelectedEquipment } from './types'
import { customers, equipment, equipmentCategories, findRate, jobTypes, levelsForJobType } from './lib/normalize'
import { defaultHoursFor, generateEstimateId, laborCost, laborRange, partsCost } from './lib/estimate'
import { formatCurrency } from './lib/format'
import { JOB_TYPE_LABELS, LEVEL_LABELS } from './lib/labels'
import { STEPS } from './lib/steps'
import QuestionLayout from './components/QuestionLayout'
import ChoiceQuestion from './components/questions/ChoiceQuestion'
import TextQuestion from './components/questions/TextQuestion'
import HoursQuestion from './components/questions/HoursQuestion'
import LookupQuestion from './components/questions/LookupQuestion'
import NameAddressQuestion from './components/questions/NameAddressQuestion'
import EquipmentQuestion from './components/questions/EquipmentQuestion'
import NotesQuestion from './components/questions/NotesQuestion'
import ReviewStep from './components/ReviewStep'

function customerToForm(customer: Customer): CustomerFormState {
  return {
    name: customer.name,
    address: customer.address,
    phone: customer.phone ?? '',
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
  const [stepIndex, setStepIndex] = useState(0)

  const [customerForm, setCustomerForm] = useState<CustomerFormState>(EMPTY_CUSTOMER_FORM)

  const [jobType, setJobType] = useState('')
  const [level, setLevel] = useState('')
  const [hours, setHours] = useState(0)

  const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment[]>([])
  const [notes, setNotes] = useState('')

  const [estimateId] = useState(() => generateEstimateId())
  const estimateDate = useMemo(
    () => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    [],
  )

  const rate = useMemo(() => findRate(jobType, level), [jobType, level])
  const laborTotal = useMemo(() => laborCost(rate, hours), [rate, hours])
  const partsSubtotal = useMemo(() => partsCost(selectedEquipment, equipment), [selectedEquipment])
  const total = laborTotal + partsSubtotal
  const range = useMemo(() => laborRange(rate), [rate])
  const rangeMin = range.min + partsSubtotal
  const rangeMax = range.max + partsSubtotal

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
    setStepIndex(0)
    setCustomerForm(EMPTY_CUSTOMER_FORM)
    setJobType('')
    setLevel('')
    setHours(0)
    setSelectedEquipment([])
    setNotes('')
  }

  const stepKey = STEPS[stepIndex]
  const stepNumber = stepIndex + 1
  const totalSteps = STEPS.length
  const onBack = stepIndex > 0 ? goBack : undefined

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
            customers={customers}
            onSelectCustomer={handleSelectCustomer}
            onStartBlank={handleStartBlank}
            onContinue={goNext}
          />
        </QuestionLayout>
      )}

      {stepKey === 'nameAddress' && (
        <QuestionLayout
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          onBack={onBack}
          title="Who's this estimate for?"
          footer={
            <ContinueButton
              disabled={customerForm.name.trim() === '' || customerForm.address.trim() === ''}
              onClick={goNext}
            />
          }
        >
          <NameAddressQuestion
            name={customerForm.name}
            address={customerForm.address}
            onChangeName={(v) => handleChangeForm({ name: v })}
            onChangeAddress={(v) => handleChangeForm({ address: v })}
            onSubmit={goNext}
            canSubmit={customerForm.name.trim() !== '' && customerForm.address.trim() !== ''}
          />
        </QuestionLayout>
      )}

      {stepKey === 'phone' && (
        <QuestionLayout
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          onBack={onBack}
          title="What's the best phone number?"
          subtitle="Optional — you can skip this."
          footer={<ContinueButton onClick={goNext} />}
        >
          <TextQuestion
            type="tel"
            value={customerForm.phone}
            onChange={(v) => handleChangeForm({ phone: v })}
            onSubmit={goNext}
            canSubmit
            placeholder="(217) 555-0100"
          />
        </QuestionLayout>
      )}

      {stepKey === 'propertyType' && (
        <QuestionLayout
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          onBack={onBack}
          title="Is this a residential or commercial property?"
        >
          <ChoiceQuestion
            value={customerForm.propertyType}
            onSelect={(v) => handleChangeForm({ propertyType: v as 'residential' | 'commercial' })}
            onContinue={goNext}
            options={[
              { value: 'residential', label: 'Residential' },
              { value: 'commercial', label: 'Commercial' },
            ]}
          />
        </QuestionLayout>
      )}

      {stepKey === 'squareFootage' && (
        <QuestionLayout
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          onBack={onBack}
          title="About how big is the property?"
          subtitle="Square footage in feet — optional."
          footer={<ContinueButton onClick={goNext} />}
        >
          <TextQuestion
            type="number"
            value={customerForm.squareFootage}
            onChange={(v) => handleChangeForm({ squareFootage: v })}
            onSubmit={goNext}
            canSubmit
            placeholder="2200"
          />
        </QuestionLayout>
      )}

      {stepKey === 'systemType' && (
        <QuestionLayout
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          onBack={onBack}
          title="What system is currently installed?"
          subtitle="Optional."
          footer={<ContinueButton onClick={goNext} />}
        >
          <TextQuestion
            value={customerForm.systemType}
            onChange={(v) => handleChangeForm({ systemType: v })}
            onSubmit={goNext}
            canSubmit
            placeholder="Central AC + Gas Furnace"
          />
        </QuestionLayout>
      )}

      {stepKey === 'systemAge' && (
        <QuestionLayout
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          onBack={onBack}
          title="How old is the current system?"
          subtitle="In years — optional."
          footer={<ContinueButton onClick={goNext} />}
        >
          <TextQuestion
            type="number"
            value={customerForm.systemAge}
            onChange={(v) => handleChangeForm({ systemAge: v })}
            onSubmit={goNext}
            canSubmit
            placeholder="12"
          />
        </QuestionLayout>
      )}

      {stepKey === 'jobType' && (
        <QuestionLayout
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          onBack={onBack}
          title="What type of job is this?"
        >
          <ChoiceQuestion
            value={jobType}
            onSelect={(v) => {
              setJobType(v)
              setLevel('')
              setHours(0)
            }}
            onContinue={goNext}
            options={jobTypes.map((jt) => ({ value: jt, label: JOB_TYPE_LABELS[jt] ?? jt }))}
          />
        </QuestionLayout>
      )}

      {stepKey === 'level' && (
        <QuestionLayout
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          onBack={onBack}
          title="What level of work does it need?"
        >
          <ChoiceQuestion
            value={level}
            onSelect={handleSelectLevel}
            onContinue={goNext}
            options={levelsForJobType(jobType).map((r) => ({
              value: r.level,
              label: LEVEL_LABELS[r.level] ?? r.level,
              helper: `${formatCurrency(r.hourlyRate, true)}/hr · ${r.estimatedHours.min}–${r.estimatedHours.max} hrs`,
            }))}
          />
        </QuestionLayout>
      )}

      {stepKey === 'hours' && rate && (
        <QuestionLayout
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          onBack={onBack}
          title="How many hours will this job take?"
          subtitle="We've set a typical starting point — drag to adjust."
          footer={<ContinueButton onClick={goNext} />}
        >
          <HoursQuestion rate={rate} hours={hours} onChange={setHours} />
        </QuestionLayout>
      )}

      {stepKey === 'equipment' && (
        <QuestionLayout
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          onBack={onBack}
          title="Does this job need equipment or parts?"
          subtitle="Search the catalog and add anything needed. Skip if it's labor only."
          footer={<ContinueButton onClick={goNext} />}
        >
          <EquipmentQuestion
            catalog={equipment}
            categories={equipmentCategories}
            selected={selectedEquipment}
            onAdd={handleAddEquipment}
            onRemove={handleRemoveEquipment}
            onSetQuantity={handleSetQuantity}
          />
        </QuestionLayout>
      )}

      {stepKey === 'notes' && (
        <QuestionLayout
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          onBack={onBack}
          title="Anything else the office should know?"
          subtitle="Optional."
          footer={<ContinueButton label="See my estimate" onClick={goNext} />}
        >
          <NotesQuestion value={notes} onChange={setNotes} />
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
