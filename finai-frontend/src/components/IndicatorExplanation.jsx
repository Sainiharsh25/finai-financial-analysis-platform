
import { usePreferences } from '../hooks/PreferencesContext'

function IndicatorExplanation({ indicator }) {
  const { preferences } = usePreferences()

  return (
    <div>
      <h3 className="font-semibold">
        {indicator.name}
      </h3>

      <p className="text-sm">
        Signal: {indicator.signal}
      </p>

      {preferences.aiExplanations && indicator.explanation && (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {indicator.explanation}
        </p>
      )}
    </div>
  )
}

export default IndicatorExplanation
